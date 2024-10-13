<template>
	<div class="h-screen bg-black">
		<div class="flex h-[90%] flex-row gap-0">
			<video
				autoPlay
				playsInline
				ref="localVideo"
				:class="chatIsOpen ? 'w-5/6' : 'w-full'"
				:muted="isHost === 'true'"
			></video>
			<Chat
				v-if="chatIsOpen"
				:chats="chatMessages"
				:class="chatIsOpen ? 'w-1/6' : 'w-0'"
				:using-live-kit="false"
			>
			</Chat>
		</div>

		<div class="h-[10%]">
			<RoomInfo
				:roomName="currentRoom"
				:users="users"
				:username="username ?? ''"
				:host="currentHost"
				:isHost="isHost ?? ''"
				:isSfu="false"
			/>
		</div>
		<!-- Dialog component -->
		<Dialog
			v-model="dialogVisible"
			header="Failed to join/host"
			:visible="dialogVisible"
			@hide="
				() => {
					dialogVisible = false
				}
			"
		>
			<p>Hosting/Joining room failed, error message: {{ failureMessage }}</p>
			<Button type="button" @click="router.push('/')">Close</Button>
		</Dialog>
	</div>
</template>

<script setup lang="ts">
import moment from "moment"

const { chatMessages, pushMessage, pushNotification } = useChatMessage()
const users = ref<User[]>([])
const chatIsOpen = ref(true)
const { socket } = useSocketIo()
const {
	getPeerConnection,
	createOffer,
	createAnswer,
	addAnswer,
	toggleStream,
	isStreaming,
	removePeerConnection
} = useWebRtc()
const {
	toggleScreenshare,
	hostRoom,
	leaveRoom,
	joinRoom,
	currentUsername,
	participantNames,
	sendMessageLiveKit
} = useLiveKit()
const currentRoom = ref("")
const currentHost = ref("")
const localVideo = ref<HTMLMediaElement | null>(null)
const dialogVisible = useState<boolean>("diaglogVisible", () => false)
const failureMessage = useState<string>("failureMessage", () => "")

const botName = "Notification"
const route = useRoute()
const router = useRouter()

const leave = async () => {
	await leaveRoom()
	router.push("/")
}

const handleToggleChat = () => {
	chatIsOpen.value = !chatIsOpen.value
}

const handleToggleStream = () => {
	const userIds = computed(() =>
		users.value
			.filter((user) => user.username !== username)
			.map((user) => user.id)
	)

	if (localVideo.value) {
		toggleStream(userIds.value, localVideo.value)
	}
}

const adjustVolume = (event: KeyboardEvent) => {
	if (!localVideo.value) return

	const volumeChangeAmount = 0.1
	switch (event.key) {
		case "ArrowUp":
			localVideo.value.volume = Math.min(
				localVideo.value.volume + volumeChangeAmount,
				1
			)
			break
		case "ArrowDown":
			localVideo.value.volume = Math.max(
				localVideo.value.volume - volumeChangeAmount,
				0
			)
			break
	}
}

const toggleFullScreen = (): void => {
	if (!localVideo.value) return

	if (!document.fullscreenElement) {
		if (localVideo.value.requestFullscreen) {
			localVideo.value.requestFullscreen()
		} else if ((localVideo.value as any).mozRequestFullScreen) {
			/* Firefox */
			;(localVideo.value as any).mozRequestFullScreen()
		} else if ((localVideo.value as any).webkitRequestFullscreen) {
			/* Chrome, Safari & Opera */
			;(localVideo.value as any).webkitRequestFullscreen()
		} else if ((localVideo.value as any).msRequestFullscreen) {
			/* IE/Edge */
			;(localVideo.value as any).msRequestFullscreen()
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen()
		} else if ((document as any).mozCancelFullScreen) {
			/* Firefox */
			;(document as any).mozCancelFullScreen()
		} else if ((document as any).webkitExitFullscreen) {
			/* Chrome, Safari and Opera */
			;(document as any).webkitExitFullscreen()
		} else if ((document as any).msExitFullscreen) {
			/* IE/Edge */
			;(document as any).msExitFullscreen()
		}
	}
}

const preventPlayPause = (event: MouseEvent): void => {
	event.preventDefault()
	toggleFullScreen()
}

provide("sendMessage", sendMessageLiveKit)
provide("handleToggleStream", handleToggleStream)
provide("ToggleChat", handleToggleChat)
provide("leaveRoom", leave)

const { username, room, isHost } = route.query as Partial<UrlParam>
onMounted(async () => {
	if (!username || !room) {
		router.push("/")
		return
	}
	// check if room already exist
	const res = await fetch(`/api/roomCheck?roomName=${room}`, {
		method: "GET"
	})

	if (!res.ok) {
		dialogVisible.value = true
		failureMessage.value = "Error Checking if room already exist"
		return
	}

	const data = await res.json()

	try {

		if (isHost === "true") { // hosting room
			if (data.roomExist) {
				dialogVisible.value = true
				failureMessage.value = "Room already exist"
				return
			}
			await hostRoom(room.toString() ?? "", username.toString() ?? "")
			currentHost.value = username
			currentRoom.value = room

		} else {	// joining existing room
			if (!data.roomExist) { // check if room exist
				dialogVisible.value = true
				failureMessage.value = "Room does not exist"
				return
			}

			if (localVideo.value) {
				const { host } = await joinRoom(
					room.toString() ?? "",
					username.toString() ?? "",
					localVideo.value
				)
				currentHost.value = host
				currentRoom.value = room
			}

		}
	}
	catch (err: any) {

	}

	socket.on(
		"receiveWebRTCMessage",
		(response: { username: string; payload: string; socketId: string }) => {
			const message = JSON.parse(response.payload)
			switch (message.type) {
				case "offer":
					if (localVideo.value) {
						createAnswer(response.socketId, message.offer, localVideo.value)
					}
					break
				case "answer":
					addAnswer(message.answer, response.socketId)
					break
				case "candidate":
					const pc = getPeerConnection(response.socketId)
					if (pc) {
						pc.addIceCandidate(new RTCIceCandidate(message.candidate))
					}
					break
			}
		}
	)

	window.addEventListener("keydown", adjustVolume)

	if (localVideo.value) {
		// Add click event listener to prevent play/pause
		localVideo.value.addEventListener("click", preventPlayPause)
	}
})

onBeforeUnmount(() => {
	window.removeEventListener("keydown", adjustVolume)
	if (localVideo.value) {
		// Remove the click event listener
		localVideo.value.removeEventListener("click", preventPlayPause)
	}
})
</script>