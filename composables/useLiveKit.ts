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
} from "livekit-client"
import moment from "moment"

const participantNames = ref<string[]>([])
const wsUrl = "wss://mello-d6rzaz12.livekit.cloud"
const token = ref<string>("")
const currentRoom = ref<Room | null>(null)
const currentUsername = ref<string>("")

export function useLiveKit() {
	const { pushNotification, pushMessage } = useChatMessage()

	const fetchToken = async (
		roomName: string,
		username: string,
		canPublish: boolean,
		canSubscribe: boolean,
	) => {
		const params = new URLSearchParams({
			room: roomName,
			username: username,
			canPublish: canPublish.toString(),
			canSubscribe: canSubscribe.toString(),
		})

		const response = await fetch(`/api/getLiveKitToken?${params.toString()}`, {
			method: "GET",
		})

		if (response.ok) {
			const data = await response.json() // Parse the response to JSON
			token.value = data.token // Access the token from the parsed data

			return {
				token: data.token,
				host: data.host ?? "",
				participantNames: data.participantNames,
			}
		} else {
			throw new Error(`Error fetching token: 
				HTTP request status ${response.status}`)
		}
	}

	const joinRoom = async (
		roomName: string,
		username: string,
		remoteVideoElement: HTMLMediaElement,
	) => {
		const handleTrackSubscribed = async (
			_track: RemoteTrack,
			publication: RemoteTrackPublication,
			_participant: RemoteParticipant,
		) => {
			publication.setVideoQuality(2)
			publication.setVideoFPS(60)
			publication.videoTrack?.attach(remoteVideoElement)
			publication.audioTrack?.attach(remoteVideoElement)
		}

		if (!roomName || !username) {
			throw new Error("missing input")
		}

		currentRoom.value?.disconnect()
		currentUsername.value = username

		const fetchedToken = await fetchToken(roomName, username, true, true)
		currentRoom.value = new Room()
		currentRoom.value?.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
		currentRoom.value.on(RoomEvent.ParticipantConnected, handleParticipantJoin)
		currentRoom.value.on(
			RoomEvent.ParticipantDisconnected,
			handleParticipantLeave,
		)
		await currentRoom.value.connect(wsUrl, token.value)

		participantNames.value = fetchedToken?.participantNames

		currentRoom.value.on(RoomEvent.ChatMessage, handleChatMessage)

		return {
			host: fetchedToken?.host,
		}
	}

	const leaveRoom = async () => {
		if (currentRoom.value) {
			await currentRoom.value?.disconnect()
		}
	}

	const hostRoom = async (roomName: string, username: string) => {
		currentRoom.value?.disconnect()

		await fetchToken(roomName, username, true, true)
		currentUsername.value = username

		const options: RoomOptions = {
			adaptiveStream: false,
			disconnectOnPageLeave: true,
			videoCaptureDefaults: {
				resolution: {
					height: 1440,
					width: 2560,
					frameRate: 60,
				},
			},
			audioCaptureDefaults: {
				autoGainControl: false,
				noiseSuppression: false,
				echoCancellation: false,
				channelCount: 2,
				sampleRate: 48000,
				sampleSize: 16,
			},
		}

		currentRoom.value = new Room(options)
		currentRoom.value.on(RoomEvent.ParticipantConnected, handleParticipantJoin)
		currentRoom.value.on(RoomEvent.ParticipantDisconnected, handleParticipantLeave)

		await currentRoom.value?.connect(wsUrl, token.value)

		currentRoom.value.on(RoomEvent.ChatMessage, handleChatMessage)
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
		participant?: RemoteParticipant | LocalParticipant | undefined,
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
				sampleSize: 16,
			},
			preferCurrentTab: false,
			resolution: {
				height: 1440,
				width: 2560,
				frameRate: 60,
			},
		}

		const screenshareEnabled =
			currentRoom.value?.localParticipant.isScreenShareEnabled

		const screensharePub =
			await currentRoom.value?.localParticipant.setScreenShareEnabled(
				!screenshareEnabled,
				screenshareSettings,
			)

		screensharePub?.videoTrack?.attach(videoElement)
	}

	const sendMessageLiveKit = async (msg: string) => {
		await currentRoom.value?.localParticipant.sendChatMessage(msg)
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
	}
}
