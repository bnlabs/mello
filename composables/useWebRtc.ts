import { useSocketIo } from "@/composables/useSocketIo"

// Define a type for the peer connections map
type PeerConnectionsMap = Map<string, RTCPeerConnection>

export function useWebRtc() {
	let localStream: MediaStream | null

	const peerConnections: Ref<PeerConnectionsMap> = ref(new Map())

	const { socket } = useSocketIo()
	const servers = {
		iceServers: [
			{
				urls: [
					"stun:global.stun.twilio.com:3478",
					"stun:stun4.l.google.com:19302",
					"stun:stun3.l.google.com:19302",
					"stun:stun.l.google.com:19302",
				],
			},
		],
	}

	const streamSetting = {
		video: {
			width: { ideal: 2560, max: 2560 },
			height: { ideal: 1440, max: 1440 },
			frameRate: { ideal: 60, max: 60 },
		},
		audio: {
			autoGainControl: false,
			channelCount: 2,
			echoCancellation: false,
			noiseSuppression: false,
			sampleRate: 48000,
			sampleSize: 16,
		},
	}

	const getPeerConnection = (uid: string) => {
		return peerConnections.value.get(uid)
	}

	const createPeerConnection = async (
		uid: string,
		videoPlayer: HTMLMediaElement,
	) => {
		const newPeerConnection = new RTCPeerConnection(servers)

		localStream = await navigator.mediaDevices.getDisplayMedia(streamSetting)
		if (videoPlayer) {
			videoPlayer.srcObject = localStream
		}

		localStream.getTracks().forEach((track: MediaStreamTrack) => {
			newPeerConnection.addTrack(track, localStream as MediaStream)
			track.onended = function () {
				localStream = null
			}
		})

		newPeerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				const payload = JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
				})
				socket.emit("sendWebRTCMessage", payload, uid)
			}
		}

		peerConnections.value.set(uid, newPeerConnection)

		return newPeerConnection
	}

	const createPeerConnectionAnswer = async (
		uid: string,
		videoPlayer: HTMLMediaElement,
	) => {
		const newPeerConnection = new RTCPeerConnection(servers)
		localStream = new MediaStream()

		if (videoPlayer) {
			videoPlayer.srcObject = localStream
		}

		newPeerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				localStream?.addTrack(track)
				track.onended = function () {
					localStream = null
				}
			})
		}

		newPeerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				const payload = JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
				})
				socket.emit("sendWebRTCMessage", payload, uid)
			}
		}

		peerConnections.value.set(uid, newPeerConnection)

		return newPeerConnection
	}

	const createOffer = async (videoPlayer: HTMLMediaElement, uid: string) => {
		const pCon = await createPeerConnection(uid, videoPlayer)
		if (pCon) {
			const offer = await pCon.createOffer()
			pCon.setLocalDescription(offer)
			const payload = JSON.stringify({ type: "offer", offer: offer })
			socket.emit("sendWebRTCMessage", payload, uid)
		}
	}

	const createAnswer = async (
		uid: string,
		offer: RTCSessionDescriptionInit,
		videoPlayer: HTMLMediaElement,
	) => {
		await clearPeerConnection()
		const pCon = await createPeerConnectionAnswer(uid, videoPlayer)
		await pCon.setRemoteDescription(offer)
		const answer = await pCon.createAnswer()
		await pCon.setLocalDescription(answer)
		const payload = JSON.stringify({ type: "answer", answer: answer })
		socket.emit("sendWebRTCMessage", payload, uid)
	}

	const addAnswer = (answer: RTCSessionDescriptionInit, uid: string) => {
		let pCon: RTCPeerConnection | undefined = peerConnections.value.get(uid)
		if (pCon && !pCon.currentRemoteDescription) {
			pCon.setRemoteDescription(answer)
		}
	}

	const createOfferToLobby = async (
		userIds: string[],
		videoPlayer: HTMLMediaElement,
	) => {
		userIds.forEach(async (uid) => {
			clearPeerConnection()
			const pCon = await createPeerConnection(uid, videoPlayer)
			if (pCon) {
				const offer = await pCon.createOffer()
				await pCon.setLocalDescription(offer)
				const payload = JSON.stringify({ type: "offer", offer: offer })
				socket.emit("sendWebRTCMessage", payload, uid)
			}
		})
	}

	const toggleStream = async (
		userIds: string[],
		videoPlayer: HTMLMediaElement,
	) => {
		// Check if localStream exists and if it has video tracks
		const videoTrack = localStream && localStream.getVideoTracks()[0]

		// If videoTrack exists and is still active, stop the stream.
		if (videoTrack && videoTrack.readyState !== "ended") {
			await endStream()
		} else {
			// If videoTrack is ended or doesn't exist, try to acquire the stream
			try {
				createOfferToLobby(userIds, videoPlayer)
			} catch (err) {
				console.error("Error acquiring stream: ", err)
			}
		}
	}

	const isStreaming = () => {
		const videoTrack = localStream && localStream.getVideoTracks()[0]
		if (!videoTrack) {
			return false
		}
		return videoTrack && videoTrack.readyState !== "ended"
	}

	const endStream = async () => {
		const videoTrack = localStream && localStream.getVideoTracks()[0]
		if (videoTrack && videoTrack.readyState !== "ended") {
			localStream?.getTracks().forEach((track) => track.stop())
			localStream = null
		}

		await clearPeerConnection()
	}

	const clearPeerConnection = async () => {
		peerConnections.value.forEach((pc, socketId) => {
			pc.close()
			peerConnections.value.delete(socketId)
		})
	}

	// Cleanup on component unmount
	onUnmounted(async () => {
		await endStream()
	})

	return {
		getPeerConnection,
		createOffer,
		createAnswer,
		addAnswer,
		toggleStream,
		isStreaming,
	}
}
