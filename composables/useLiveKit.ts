import {
	LocalParticipant,
	Participant,
	RemoteParticipant,
	RemoteTrack,
	RemoteTrackPublication,
	Room,
	RoomEvent,
	type RoomOptions,
	type ScreenShareCaptureOptions,
	type ChatMessage as LiveKitChatMessage,
	DataPacket_Kind,
	type DataPublishOptions
} from "livekit-client"
import moment from "moment"

const runtimeConfig = useRuntimeConfig()
const participantNames = ref<string[]>([])
const wsUrl = runtimeConfig.public.livekitWSurl
const token = ref<string>("")
const currentRoom = ref<Room | null>(null)
const currentUsername = ref<string>("")
const isServerSideStreaming = ref<boolean>()

// Define a type for the peer connections map
type PeerConnectionsMap = Map<string, RTCPeerConnection>

// these states are used for p2p streams
const localStream = ref<MediaStream | null>(null)
const peerConnections: Ref<PeerConnectionsMap> = ref(new Map())
const servers = {
	iceServers: [
		{
			urls: [
				"stun:global.stun.twilio.com:3478",
				"stun:stun4.l.google.com:19302",
				"stun:stun3.l.google.com:19302",
				"stun:stun.l.google.com:19302"
			]
		}
	]
}
const streamSetting = {
	video: {
		width: { ideal: 2560, max: 2560 },
		height: { ideal: 1440, max: 1440 },
		frameRate: { ideal: 60, max: 60 }
	},
	audio: {
		autoGainControl: false,
		channelCount: 2,
		echoCancellation: false,
		noiseSuppression: false,
		sampleRate: 48000,
		sampleSize: 16
	}
}

export function useLiveKit() {
	const { pushNotification, pushMessage, clearMessages } = useChatMessage()

	const fetchToken = async (
		roomName: string,
		username: string,
		isHost: boolean
	) => {
		const params = new URLSearchParams({
			room: roomName,
			username: username
		})

		if (isHost) {
			// Hosting Room
			const response = await fetch(
				`/api/livekit/generateTokenForHostRoom?${params.toString()}`,
				{
					method: "GET"
				}
			)

			if (response.ok) {
				const data = await response.json() // Parse the response to JSON
				token.value = data.token // Access the token from the parsed data

				return {
					token: data.token
				}
			} else {
				throw new Error(`Error fetching token: 
					HTTP request status ${response.status}`)
			}
		} else {
			// Joining a room
			const response = await fetch(
				`/api/livekit/generateTokenForJoinRoom?${params.toString()}`,
				{
					method: "GET"
				}
			)

			if (response.ok) {
				const data = await response.json() // Parse the response to JSON
				token.value = data.token // Access the token from the parsed data

				if (data.statusCode === 409) {
					throw new Error("Username is Taken")
				}
				return {
					host: data.host,
					token: data.token,
					participantNames: data.participantNames
				}
			} else {
				throw new Error(`Error fetching token: 
					HTTP request status ${response.status}`)
			}
		}
	}

	const joinRoom = async (
		roomName: string,
		username: string,
		remoteVideoElement: HTMLMediaElement
	) => {
		const handleTrackSubscribed = async (
			_track: RemoteTrack,
			publication: RemoteTrackPublication,
			_participant: RemoteParticipant
		) => {
			publication.setVideoQuality(2)
			publication.setVideoFPS(60)
			publication.videoTrack?.attach(remoteVideoElement)
			publication.audioTrack?.attach(remoteVideoElement)
		}
		const handleDataReceived = async (
			payload: Uint8Array<ArrayBufferLike>,
			participant?: RemoteParticipant | undefined,
			_kind?: DataPacket_Kind | undefined,
			_topic?: string | undefined
		): Promise<void> => {
			const decoder = new TextDecoder()
			const strData = decoder.decode(payload)
			const message = JSON.parse(strData)

			switch (message.type) {
				case "offer":
					if (remoteVideoElement) {
						await createAnswer(
							participant?.identity ?? "",
							message.offer,
							remoteVideoElement
						)
					}
					break
				case "candidate":
					const pc = peerConnections.value.get(participant?.identity ?? "")
					if (pc) {
						pc.addIceCandidate(new RTCIceCandidate(message.candidate))
					}
					break
			}
		}

		if (!roomName || !username) {
			throw new Error("missing input")
		}

		currentRoom.value?.disconnect()
		currentUsername.value = username

		const fetchedToken = await fetchToken(roomName, username, false)
		currentRoom.value = new Room()

		// room events for p2p streaming
		currentRoom.value?.on(RoomEvent.DataReceived, handleDataReceived)

		// room events for server side streaming
		currentRoom.value?.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)

		// room events for both server side streaming and p2p
		currentRoom.value.on(RoomEvent.ParticipantConnected, handleParticipantJoin)
		currentRoom.value.on(
			RoomEvent.ParticipantDisconnected,
			handleParticipantLeave
		)
		currentRoom.value.on(RoomEvent.ChatMessage, handleChatMessage)

		await currentRoom.value.connect(wsUrl, token.value)

		participantNames.value = fetchedToken?.participantNames

		return {
			host: fetchedToken?.host
		}
	}

	const leaveRoom = async () => {
		if (currentRoom.value) {
			await currentRoom.value?.disconnect()
		}
	}

	const hostRoom = async (
		roomName: string,
		username: string,
		serverSideStreaming: boolean,
		localVideoElement: HTMLMediaElement | null
	) => {
		const handleDataReceived = async (
			payload: Uint8Array<ArrayBufferLike>,
			participant?: RemoteParticipant | undefined,
			_kind?: DataPacket_Kind | undefined,
			_topic?: string | undefined
		): Promise<void> => {
			const decoder = new TextDecoder()
			const strData = decoder.decode(payload)
			const message = JSON.parse(strData)

			switch (message.type) {
				case "answer":
					await addAnswer(participant?.identity ?? "", message.answer)
					break
				case "candidate":
					const pc = peerConnections.value.get(participant?.identity ?? "")
					if (pc) {
						pc.addIceCandidate(new RTCIceCandidate(message.candidate))
					}
					break
			}
		}

		const handleParticipantJoinAsHost = async (participant: Participant) => {
			if (!participant.name) return

			participantNames.value.push(participant.name)
			await pushNotification(`${participant.name} has joined the chat`)

			if (
				!isServerSideStreaming.value &&
				localVideoElement && // Video element shouldn't ever be null but type checking cuz typescript
				localStream.value && // Only send offer to new user if there is a stream on going
				localStream.value
					.getTracks()
					.some((track) => track.readyState === "live" && track.enabled)
			) {
				// if is not server side streaming, have to send SDP offer to new user to they can see the stream
				await createOffer(participant.identity, localVideoElement)
			}
		}

		isServerSideStreaming.value = serverSideStreaming

		currentRoom.value?.disconnect()

		await fetchToken(roomName, username, true)
		currentUsername.value = username

		const options: RoomOptions = {
			adaptiveStream: false,
			disconnectOnPageLeave: true,
			videoCaptureDefaults: {
				resolution: {
					height: 1440,
					width: 2560,
					frameRate: 60
				}
			},
			audioCaptureDefaults: {
				autoGainControl: false,
				noiseSuppression: false,
				echoCancellation: false,
				channelCount: 2,
				sampleRate: 48000,
				sampleSize: 16
			}
		}

		currentRoom.value = new Room(options)

		// room event for both P2P and sever-side streaming
		currentRoom.value.on(
			RoomEvent.ParticipantConnected,
			handleParticipantJoinAsHost
		)
		currentRoom.value.on(
			RoomEvent.ParticipantDisconnected,
			handleParticipantLeave
		)
		currentRoom.value.on(RoomEvent.ChatMessage, handleChatMessage)

		await currentRoom.value?.connect(wsUrl, token.value)

		// room events for p2p streaming
		currentRoom.value?.on(RoomEvent.DataReceived, handleDataReceived)
	}

	const handleParticipantJoin = async (participant: Participant) => {
		if (!participant.name) return

		participantNames.value.push(participant.name)
		await pushNotification(`${participant.name} has joined the chat`)
	}

	const handleParticipantLeave = async (participant: RemoteParticipant) => {
		if (!participant.name) return
		const name = participant.name
		const index = participantNames.value.findIndex((p: string) => p === name)

		if (index !== -1) {
			participantNames.value.splice(index, 1) // Remove the object at the found index
		}

		await pushNotification(`${participant.name} has left the chat`)
	}

	const handleChatMessage = async (
		message: LiveKitChatMessage,
		participant?: RemoteParticipant | LocalParticipant | undefined
	) => {
		const mappedMsg: ChatMessage = {
			username: participant?.name ?? "",
			text: message.message,
			time: moment().format("LT")
		}

		pushMessage(mappedMsg)
	}

	const toggleScreenshare = async (videoElement: HTMLMediaElement) => {
		const screenshareSettings: ScreenShareCaptureOptions = {
			audio: {
				autoGainControl: false,
				noiseSuppression: false,
				echoCancellation: false,
				channelCount: 2,
				sampleRate: 48000,
				sampleSize: 16
			},
			preferCurrentTab: false,
			resolution: {
				height: 1440,
				width: 2560,
				frameRate: 60
			}
		}

		const screenshareEnabled =
			currentRoom.value?.localParticipant.isScreenShareEnabled

		const screensharePub =
			await currentRoom.value?.localParticipant.setScreenShareEnabled(
				!screenshareEnabled,
				screenshareSettings
			)

		screensharePub?.videoTrack?.attach(videoElement)
	}

	const toggleScreenshareP2P = async (videoElement: HTMLMediaElement) => {
		// foreach users in the lobby, create and send webrtc offer
		// make api call to get all participants
		const res = await fetch(
			`/api/livekit/getUsersInRoom?roomName=${currentRoom.value?.name.toString().trim()}`,
			{
				method: "GET"
			}
		)

		if (!res.ok) {
			throw new Error("error fetching users in lobby")
		}

		const data = await res.json()
		await clearPeerConnection()

		// foreach users in the lobby
		if (
			localStream.value &&
			localStream.value
				.getTracks()
				.some((track) => track.readyState === "live" && track.enabled)
		) {
			await endStream()
		} else {
			for (const p of data.result) {
				if (p.name === currentUsername.value) {
					continue // Skip to the next iteration
				}
				await createOffer(p.identity, videoElement)
			}
		}
	}

	const sendMessageLiveKit = async (msg: string) => {
		await currentRoom.value?.localParticipant.sendChatMessage(msg)
	}

	const sendWebSocketPayload = async (
		payload: object,
		options?: DataPublishOptions
	) => {
		const strData = JSON.stringify(payload)
		const encoder = new TextEncoder()

		// publishData takes in a Uint8Array, so we need to convert it
		const data = encoder.encode(strData)

		if (options) {
			currentRoom.value?.localParticipant.publishData(data, options)
		} else {
			currentRoom.value?.localParticipant.publishData(data, { reliable: true })
		}
	}

	const createPeerConnection = async (
		identity: string,
		videoPlayer: HTMLMediaElement
	) => {
		const newPeerConnection = new RTCPeerConnection(servers)

		// this if statement block is needed because if its not there, and host toggle stream, the host will be prompted if there are more than one audience
		if (!localStream.value) {
			localStream.value =
				await navigator.mediaDevices.getDisplayMedia(streamSetting)
		}

		if (videoPlayer) {
			videoPlayer.srcObject = localStream.value
		}

		localStream.value.getTracks().forEach((track: MediaStreamTrack) => {
			newPeerConnection.addTrack(track, localStream.value as MediaStream)
			track.onended = function () {
				localStream.value?.getTracks().forEach((track) => track.stop())
				localStream.value = null
			}
		})

		newPeerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				const payload = {
					type: "candidate",
					candidate: event.candidate
				}

				await sendWebSocketPayload(payload, {
					reliable: true,
					destinationIdentities: [identity]
				})
			}
		}

		peerConnections.value.set(identity, newPeerConnection)
		return peerConnections.value.get(identity)
	}

	const createOffer = async (
		identity: string,
		videoPlayer: HTMLMediaElement
	) => {
		const peerConnection = await createPeerConnection(identity, videoPlayer)
		if (peerConnection) {
			const offer = await peerConnection.createOffer()
			peerConnection.setLocalDescription(offer)
			const payload = { type: "offer", offer: offer }

			// send offer
			await sendWebSocketPayload(payload, {
				reliable: true,
				destinationIdentities: [identity]
			})
		}
	}

	const createAnswer = async (
		identity: string,
		offer: RTCSessionDescriptionInit,
		videoPlayer: HTMLMediaElement
	) => {
		await clearPeerConnection()

		const peerConnection = await createPeerConnectionAnswer(
			identity,
			videoPlayer
		)
		await peerConnection?.setRemoteDescription(offer)

		const answer = await peerConnection?.createAnswer()

		await peerConnection?.setLocalDescription(answer)

		const payload = { type: "answer", answer: answer }

		await sendWebSocketPayload(payload, {
			reliable: true,
			destinationIdentities: [identity]
		})
	}

	const addAnswer = async (
		identity: string,
		answer: RTCSessionDescriptionInit
	) => {
		const peerConnection: RTCPeerConnection | undefined =
			peerConnections.value.get(identity)
		if (peerConnection) {
			peerConnection.setRemoteDescription(answer)
		}
	}

	const clearPeerConnection = async () => {
		peerConnections.value.forEach((pc, _) => {
			pc.close()
		})

		peerConnections.value.clear()
	}

	const createPeerConnectionAnswer = async (
		identity: string,
		videoPlayer: HTMLMediaElement
	) => {
		const oldPeerConnection = peerConnections.value.get(identity)
		oldPeerConnection?.close()

		const peerConnection = new RTCPeerConnection(servers)
		localStream.value?.getTracks().forEach((track) => track.stop())
		localStream.value = new MediaStream()

		peerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
				localStream.value?.addTrack(track)
				track.onended = function () {
					localStream.value?.getTracks().forEach((track) => track.stop())
					localStream.value = null
				}
			})
		}

		if (videoPlayer) {
			videoPlayer.srcObject = localStream.value
		}

		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				const payload = {
					type: "candidate",
					candidate: event.candidate
				}
				await sendWebSocketPayload(payload, {
					reliable: true,
					destinationIdentities: [identity]
				})
			}
		}

		peerConnections.value.set(identity, peerConnection)
		return peerConnections.value.get(identity)
	}

	const endStream = async () => {
		localStream.value?.getTracks().forEach((track) => track.stop())
		localStream.value = null

		await clearPeerConnection()
	}

	const cleanUpData = async () => {
		await endStream()
		await clearPeerConnection()
		clearMessages()
		currentRoom.value?.disconnect()
		participantNames.value = []
		token.value = ""
		currentRoom.value = null
		currentUsername.value = ""
	}

	return {
		toggleScreenshare,
		hostRoom,
		leaveRoom,
		joinRoom,
		fetchToken,
		token,
		currentUsername,
		currentRoom,
		participantNames,
		sendMessageLiveKit,
		sendWebSocketPayload,
		createOffer,
		createAnswer,
		addAnswer,
		toggleScreenshareP2P,
		cleanUpData,
		isServerSideStreaming
	}
}
