import {
	Participant,
	RemoteParticipant,
	RemoteTrack,
	RemoteTrackPublication,
	Room,
	RoomEvent,
	type RoomOptions,
	type ScreenShareCaptureOptions
} from "livekit-client"


const participantNames = ref<string[]>([])
const wsUrl = "wss://mello-d6rzaz12.livekit.cloud"
const token = ref<string>("")
const currentRoom = ref<Room | null>(null)
const currentUsername = ref<string>("")

export function useLiveKit() {
	const { pushMessage } = useChatMessage()

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
				participantNames: data.participantNames
			}

		} else {
			throw new Error("error fetching token")
		}
	}

	const joinRoom = async (
		roomName: string,
		username: string,
		remoteVideoElement: HTMLMediaElement,
	) => {
		const handleTrackSubscribed = async (
			track: RemoteTrack,
			publication: RemoteTrackPublication,
			participant: RemoteParticipant,
		) => {
			publication.videoTrack?.attach(remoteVideoElement)
		}

		currentRoom.value?.disconnect()
		currentUsername.value = username

		const fetchedToken = await fetchToken(roomName, username, false, true)
		currentRoom.value = new Room()
		currentRoom.value?.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
		currentRoom.value.on(RoomEvent.ParticipantConnected, handleParticipantJoin)
		currentRoom.value.on(
			RoomEvent.ParticipantDisconnected,
			handleParticipantLeave,
		)
		currentRoom.value.connect(wsUrl, fetchedToken?.token)

		participantNames.value = fetchedToken.participantNames

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

		await fetchToken(roomName, username, true, false)
		currentUsername.value = username

		const options: RoomOptions = {
			adaptiveStream: false,
			disconnectOnPageLeave: true,
			videoCaptureDefaults: {
				resolution:  {
					height: 1440,
					width: 2560,
					frameRate: 100
				}
			}
		}

		currentRoom.value = new Room(options)
		currentRoom.value.on(RoomEvent.ParticipantConnected, handleParticipantJoin)
		currentRoom.value.on(
			RoomEvent.ParticipantDisconnected,
			handleParticipantLeave,
		)

		await currentRoom.value?.connect(wsUrl, token.value)
	}

	const handleParticipantJoin = async (participant: Participant) => {
		if(!participant.name) return

		participantNames.value.push(participant.name)
		await pushMessage(`${participant.name} has joined the chat`)
	}

	const handleParticipantLeave = async (participant: RemoteParticipant) => {
		if(!participant.name) return
		const name = participant.name
		const index = participantNames.value.findIndex((p: string) => p === name)

		if (index !== -1) {
			participantNames.value.splice(index, 1) // Remove the object at the found index
		}

		await pushMessage(`${participant.name} has left the chat`)
		
	}

	const toggleScreenshare = async (videoElement: HTMLMediaElement) => {
		const screenshareSettings: ScreenShareCaptureOptions = {
			audio: true,
			preferCurrentTab: false,
			resolution:  {
				height: 1440,
				width: 2560,
				frameRate: 60
			}
		}

		const screenshareEnabled = currentRoom.value?.localParticipant.isScreenShareEnabled

		const screensharePub = await currentRoom.value?.localParticipant.setScreenShareEnabled(!screenshareEnabled, screenshareSettings)

		screensharePub?.videoTrack?.attach(videoElement)
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
	}
}
