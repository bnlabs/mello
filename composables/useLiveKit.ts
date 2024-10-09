import {
	Participant,
	RemoteParticipant,
	RemoteTrack,
	RemoteTrackPublication,
	Room,
	RoomEvent,
	type RoomOptions,
} from "livekit-client"

export function useLiveKit() {
	const wsUrl = "wss://mello-d6rzaz12.livekit.cloud"
	const token = ref<string>("")
	const currentRoom = ref<Room | null>(null)
	const currentUsername = ref<string>("")
	const participants = ref<Participant[]>([])

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

			return data.token
		} else {
			console.log("error fetching token")
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
		currentRoom.value.connect(wsUrl, fetchedToken)
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

		const options: RoomOptions = {}

		currentRoom.value = new Room(options)
		currentRoom.value.on(RoomEvent.ParticipantConnected, handleParticipantJoin)
		currentRoom.value.on(
			RoomEvent.ParticipantDisconnected,
			handleParticipantLeave,
		)

		await currentRoom.value?.connect(wsUrl, token.value)
	}

	const handleParticipantJoin = async (participant: Participant) => {
		participants.value.push(participant)
		await pushMessage(`${participant.name} has joined the chat`)
	}

	const handleParticipantLeave = async (participant: RemoteParticipant) => {
		if (participant.name) {
			const name = participant.name
			const index = participants.value.findIndex((p) => p.name === name)

			if (index !== -1) {
				participants.value.splice(index, 1) // Remove the object at the found index
			}

			await pushMessage(`${participant.name} has left the chat`)
		}
	}

	const toggleScreenshare = async (videoElement: HTMLMediaElement) => {
		const screenshareEnabled =
			currentRoom.value?.localParticipant.isScreenShareEnabled
		const screensharePub =
			await currentRoom.value?.localParticipant.setScreenShareEnabled(
				!screenshareEnabled,
			)

		screensharePub?.videoTrack?.attach(videoElement)
	}

	const participantNames = computed(() => participants.value.map((p) => p.name))

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
