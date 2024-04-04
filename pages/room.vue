<template>
	<div class="h-screen bg-black">
		<div class="flex h-[90%] flex-row gap-0">
			<video
				autoPlay
				playsInline
				ref="videoPlayer"
				controls
				class="w-5/6 border-2 border-solid border-slate-500"
				:muted="isHost === 'true'"
			></video>
			<Chat :chats class="w-1/6"> </Chat>
		</div>

		<div class="h-[10%]">
			<RoomInfo
				:roomName="currentRoom"
				:users="users"
				:username="username"
				:host="currentHost"
				:isHost="isHost"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useSocketIo } from "@/composables/useSocketIo"
import { useWebRtc } from "@/composables/useWebRtc"
import { type User } from "~/server/types"

interface Chat {
	username: string
	text: string
	time: string
	room?: string
	isHost: string
}

const chats = ref<Chat[]>([])
const users = ref<User[]>([])
const { socket } = useSocketIo()
const {
	getPeerConnection,
	createOffer,
	createAnswer,
	addAnswer,
	toggleStream,
	isStreaming,
} = useWebRtc()
const currentRoom = ref("")
const currentHost = ref("")
const videoPlayer = ref<HTMLMediaElement | null>(null)

const route = useRoute()
const router = useRouter()

const sendMessage = async (message: String) => {
	socket.emit("chatMessage", message)
}

const leaveRoom = () => {
	router.push("/")
}

const handleToggleStream = () => {
	const userIds = computed(() =>
		users.value
			.filter((user) => user.username !== username)
			.map((user) => user.id),
	)

	if (videoPlayer.value) {
		toggleStream(userIds.value, videoPlayer.value)
	}
}

provide("sendMessage", sendMessage)
provide("handleToggleStream", handleToggleStream)
provide("leaveRoom", leaveRoom)

const { username, room, isHost } = route.query as Partial<Chat>
onMounted(() => {
	if (!username || !room || !isHost) {
		router.push("/")
	}

	// Join ChatRoom
	if (isHost === "true") {
		socket.emit("hostRoom", { username, room })
	} else if (isHost === "false") {
		socket.emit("joinRoom", { username, room })
	}

	socket.on("message", (response: Chat) => {
		chats.value.push(response)
	})

	socket.on(
		"roomUsers",
		(response: {
			room: string
			users: User[]
			host: string
			newUser: User
		}) => {
			currentRoom.value = response.room
			users.value = response.users
			if (response.host) {
				currentHost.value = response.host
			}

			if (
				videoPlayer.value &&
				isHost === "true" &&
				response.newUser.username !== username &&
				isStreaming()
			) {
				createOffer(videoPlayer.value, response.newUser.id)
			}
		},
	)

	socket.on("hostingOrJoiningFailed", (response: { reason: String }) => {
		alert(`Hosting/Joining room failed, error message: ${response.reason}`)
		router.push("/")
	})

	socket.on(
		"receiveWebRTCMessage",
		(response: { username: string; payload: string; socketId: string }) => {
			const message = JSON.parse(response.payload)
			console.log(
				`message type is ${message.type} and is sent by ${response.username}`,
			)
			if (message.type === "offer" && videoPlayer.value) {
				createAnswer(response.socketId, message.offer, videoPlayer.value)
			}
			if (message.type === "answer") {
				addAnswer(message.answer, response.socketId)
			}
			if (message.type === "candidate") {
				const pc = getPeerConnection(response.socketId)
				if (pc) {
					pc.addIceCandidate(message.candidate)
				}
			}
		},
	)
})
</script>
