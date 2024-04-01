<template>
	<div class="h-screen bg-black">
		<div class="flex h-[90%] flex-row gap-0">
			<video
				controls
				class="w-5/6 border-2 border-solid border-slate-500"
			></video>

			<Chat :chats class="w-1/6"> </Chat>
		</div>

		<div class="h-[10%]">
			<RoomInfo
				:roomName="currentRoom"
				:users="users"
				:username="username"
				:host="currentHost"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { io, type Socket } from "socket.io-client"
import { ref, onMounted, onBeforeUnmount, provide } from "vue"
import { useRoute, useRouter } from "vue-router"

interface Chat {
	username: string
	text: string
	time: string
	room?: string
	isHost: string
}

type User = {
	id: string
	username: string
	room: string
}

const chats = ref<Chat[]>([])
const users = ref<User[]>([])
const socket = ref<Socket>()
const currentRoom = ref("")
const currentHost = ref("")

const route = useRoute()
const router = useRouter()

const sendMessage = async (message: String) => {
	socket.value?.emit("chatMessage", message)
}

provide("sendMessage", sendMessage)

const { username, room, isHost } = route.query as Partial<Chat>
onMounted(() => {
	if (!username || !room || !isHost) {
		router.push("/")
	}

	socket.value = io({
		path: "/api/socket.io",
	})

	// Join ChatRoom
	if (isHost === "true") {
		socket.value.emit("hostRoom", { username, room })
	} else if (isHost === "false") {
		socket.value.emit("joinRoom", { username, room })
	}

	socket.value.on("message", (response: Chat) => {
		chats.value.push(response)
	})

	socket.value.on(
		"roomUsers",
		(response: { room: string; users: User[]; host: string }) => {
			currentRoom.value = response.room
			users.value = response.users
			if (response.host) {
				currentHost.value = response.host
			}
		},
	)

	socket.value.on("hostingOrJoiningFailed", (response: { reason: String }) => {
		alert(`Hosting/Joining room failed, error message: ${response.reason}`)
		router.push("/")
	})
})

onBeforeUnmount(() => {
	socket.value?.disconnect()
})
</script>
