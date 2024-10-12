<script setup lang="ts">
import { ref, onMounted, provide } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useSocketIo } from "@/composables/useSocketIo"
import { useWebRtc } from "@/composables/useWebRtc"
import moment from "moment"

const chats = ref<ChatMessage[]>([])
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
const currentRoom = ref("")
const currentHost = ref("")
const videoPlayer = ref<HTMLMediaElement | null>(null)
const dialogVisible = useState<boolean>("diaglogVisible", () => false)
const failureMessage = useState<string>("failureMessage", () => "")

const botName = "Notification"
const route = useRoute()
const router = useRouter()

const sendMessage = async (message: String) => {
	socket.emit("chatMessage", message)
}

const leaveRoom = () => {
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

	if (videoPlayer.value) {
		toggleStream(userIds.value, videoPlayer.value)
	}
}

const adjustVolume = (event: KeyboardEvent) => {
	if (!videoPlayer.value) return

	const volumeChangeAmount = 0.1
	switch (event.key) {
		case "ArrowUp":
			videoPlayer.value.volume = Math.min(
				videoPlayer.value.volume + volumeChangeAmount,
				1
			)
			break
		case "ArrowDown":
			videoPlayer.value.volume = Math.max(
				videoPlayer.value.volume - volumeChangeAmount,
				0
			)
			break
	}
}

const toggleFullScreen = (): void => {
	if (!videoPlayer.value) return

	if (!document.fullscreenElement) {
		if (videoPlayer.value.requestFullscreen) {
			videoPlayer.value.requestFullscreen()
		} else if ((videoPlayer.value as any).mozRequestFullScreen) {
			/* Firefox */
			;(videoPlayer.value as any).mozRequestFullScreen()
		} else if ((videoPlayer.value as any).webkitRequestFullscreen) {
			/* Chrome, Safari & Opera */
			;(videoPlayer.value as any).webkitRequestFullscreen()
		} else if ((videoPlayer.value as any).msRequestFullscreen) {
			/* IE/Edge */
			;(videoPlayer.value as any).msRequestFullscreen()
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

provide("sendMessage", sendMessage)
provide("handleToggleStream", handleToggleStream)
provide("ToggleChat", handleToggleChat)
provide("leaveRoom", leaveRoom)

interface UrlParam {
	username: string
	room: string
	isHost: string
}

const { username, room, isHost } = route.query as Partial<UrlParam>
onMounted(() => {
	if (!username || !room || !isHost) {
		router.push("/")
	}

	// Join ChatRoom
	if (isHost === "true") {
		socket.emit("hostRoom", { username, room })
	} else {
		socket.emit("joinRoom", { username, room })
	}

	socket.on("message", (response: ChatMessage) => {
		chats.value.push(response)
	})

	socket.on(
		"userJoin",
		(response: {
			room: string
			users: User[]
			host: string
			newUser: User
		}) => {
			// necessary for when user start hosting a room
			currentRoom.value = response.room

			users.value = response.users
			if (response.host) {
				currentHost.value = response.host
			}

			const notificationMessage: ChatMessage = {
				username: botName,
				text: `${response.newUser.username} has joined the chat`,
				time: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
				isHost: ""
			}

			chats.value.push(notificationMessage)

			if (
				response.newUser &&
				response.newUser.username !== username &&
				videoPlayer.value &&
				isHost === "true" &&
				isStreaming()
			) {
				createOffer(videoPlayer.value, response.newUser.id)
			}
		}
	)

	socket.on(
		"userDisconnect",
		(response: { room: string; users: User[]; oldUser: User }) => {
			users.value = response.users

			if (response.oldUser) {
				removePeerConnection(response.oldUser.id)
			}

			const notifMessage: ChatMessage = {
				username: botName,
				text: `${response.oldUser.username} has left the chat`,
				time: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
				isHost: ""
			}
			chats.value.push(notifMessage)
		}
	)

	socket.on("hostingOrJoiningFailed", (response: { reason: string }) => {
		failureMessage.value = response.reason
		dialogVisible.value = true
	})

	socket.on(
		"receiveWebRTCMessage",
		(response: { username: string; payload: string; socketId: string }) => {
			const message = JSON.parse(response.payload)
			switch (message.type) {
				case "offer":
					if (videoPlayer.value) {
						createAnswer(response.socketId, message.offer, videoPlayer.value)
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

	socket.on("reconnect", (attemptNumber) => {
		const notifMessage: ChatMessage = {
			username: botName,
			text: `Reconnected to the server after ${attemptNumber} attempts.`,
			time: moment().utc().format("YYYY-MM-DDTHH:mm:ss")
		}
		chats.value.push(notifMessage)
	})

	socket.on("reconnect_attempt", (attemptNumber) => {
		const notifMessage: ChatMessage = {
			username: botName,
			text: `Attempting to reconnect (attempt ${attemptNumber})`,
			time: moment().utc().format("YYYY-MM-DDTHH:mm:ss")
		}
		chats.value.push(notifMessage)
	})

	socket.on("disconnect", (reason) => {
		const notifMessage: ChatMessage = {
			username: botName,
			text: `Disconnected: ${reason}`,
			time: moment().utc().format("YYYY-MM-DDTHH:mm:ss")
		}

		chats.value.push(notifMessage)

		// Optionally, attempt to reconnect based on the reason
		if (reason === "io server disconnect") {
			// The disconnection was initiated by the server, you need to reconnect manually
			socket.connect()
		}
	})

	socket.on("error", (error) => {
		const notifMessage: ChatMessage = {
			username: botName,
			text: `Connection Error: ${error}`,
			time: moment().utc().format("YYYY-MM-DDTHH:mm:ss")
		}

		chats.value.push(notifMessage)
	})

	window.addEventListener("keydown", adjustVolume)

	if (videoPlayer.value) {
		// Add click event listener to prevent play/pause
		videoPlayer.value.addEventListener("click", preventPlayPause)
	}
})

onBeforeUnmount(() => {
	window.removeEventListener("keydown", adjustVolume)
	if (videoPlayer.value) {
		// Remove the click event listener
		videoPlayer.value.removeEventListener("click", preventPlayPause)
	}
})
</script>

<template>
	<div class="h-screen bg-black">
		<div class="flex h-[90%] flex-row gap-0">
			<video
				autoPlay
				playsInline
				ref="videoPlayer"
				:class="chatIsOpen ? 'w-5/6' : 'w-full'"
				:muted="isHost === 'true'"
			></video>
			<Chat
				v-if="chatIsOpen"
				:chats
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
