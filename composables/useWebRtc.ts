import { useSocketIo } from "@/composables/useSocketIo"

export function useWebRtc() {
	let localStream: MediaStream | null
	let remoteStream: MediaStream | null
	let peerConnection: RTCPeerConnection

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

	const getPeerConnection = () => {
		return peerConnection
	}

	const createPeerConnection = async (
		uid: string,
		videoPlayer: HTMLMediaElement,
	) => {
		peerConnection = new RTCPeerConnection(servers)
		remoteStream = new MediaStream()

		if (!localStream) {
			localStream = await navigator.mediaDevices.getDisplayMedia(streamSetting)
			if (videoPlayer) {
				videoPlayer.srcObject = localStream
			}
		}

		localStream.getTracks().forEach((track: MediaStreamTrack) => {
			peerConnection.addTrack(track, localStream as MediaStream)
			track.onended = function () {
				localStream = null
			}
		})

		peerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				remoteStream?.addTrack(track)
				track.onended = function () {
					remoteStream = null
				}
			})
		}

		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				const payload = JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
				})
				socket.emit("sendWebRTCMessage", payload, uid)
			}
		}
	}

	const createPeerConnectionAnswer = async (
		uid: string,
		videoPlayer: HTMLMediaElement,
	) => {
		peerConnection = new RTCPeerConnection(servers)
		remoteStream = new MediaStream()

		if (videoPlayer) {
			videoPlayer.srcObject = remoteStream
		}

		peerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				remoteStream?.addTrack(track)
				track.onended = function () {
					remoteStream = null
				}
			})
		}

		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				const payload = JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
				})
				socket.emit("sendWebRTCMessage", payload, uid)
			}
		}
	}

	const createOffer = async (videoPlayer: HTMLMediaElement, uid: string) => {
		await createPeerConnection(uid, videoPlayer)
		if (peerConnection) {
			const offer = await peerConnection.createOffer()
			await peerConnection.setLocalDescription(offer)
			const payload = JSON.stringify({ type: "offer", offer: offer })
			socket.emit("sendWebRTCMessage", payload, uid)
		}
	}

	const createAnswer = async (
		uid: string,
		offer: RTCSessionDescriptionInit,
		videoPlayer: HTMLMediaElement,
	) => {
		createPeerConnectionAnswer(uid, videoPlayer)
		await peerConnection.setRemoteDescription(offer)
		const answer = await peerConnection.createAnswer()
		await peerConnection.setLocalDescription(answer)
		const payload = JSON.stringify({ type: "answer", answer: answer })
		socket.emit("sendWebRTCMessage", payload, uid)
	}

	const addAnswer = (answer: RTCSessionDescriptionInit) => {
		if (peerConnection && !peerConnection.currentRemoteDescription) {
			peerConnection.setRemoteDescription(answer)
		}
	}

	// const createOfferToLobby = async (room: string, videoPlayer : HTMLMediaElement) => {
	//     await createPeerConnection(videoPlayer);

	//     if(peerConnection)
	//     {
	//         const offer = await peerConnection.createOffer();
	//         await peerConnection.setLocalDescription(offer);
	//         const text = JSON.stringify({'type': 'offer', 'offer': offer});
	//         socket.emit("sendWebRTCMessage", text)
	//     }
	// }

	return {
		getPeerConnection,
		createOffer,
		createAnswer,
		addAnswer,
	}
}
