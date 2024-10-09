<template>
	<div class="flex h-screen w-full flex-col bg-black">
		<div class="flex h-[90%] w-full flex-row">
			<video
				autoPlay
				playsInline
				ref="localVideo"
				:class="chatIsOpen ? 'w-5/6' : 'w-full'"
				:muted="isHost === 'true'"
			/>

			<Chat v-if="chatIsOpen"
				:chats="[]"
			 	:class="chatIsOpen ? 'w-1/6' : 'w-0'"
			/>
		</div>

		<div
			class="Room-Info flex h-[10%] flex-row items-center justify-between pl-4"
		>
			<div class="flex h-full items-center gap-3">
				<RoomInfoSlot title="Room">
					<span class="text-black"> {{ room }}</span>
				</RoomInfoSlot>

				<RoomInfoSlot title="Username">
					<span class="text-black"> {{ currentUsername }}</span>
				</RoomInfoSlot>

				<RoomInfoSlot title="Host">
					<span class="text-black"> {{}}</span>
				</RoomInfoSlot>

				<RoomUserList :users="[]" />
			</div>

			<div class="flex flex-row gap-5 pr-3">
				<Button severity="info" @click="handleToggleChat" outlined> Hide Chat</Button>
				<Button v-if="isHost === 'true'" @click="screenshare" outlined
					>Stream</Button
				>
				<Button @click="leave" severity="danger" outlined>Leave Room</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface UrlParam {
	username: string
	room: string
	isHost: string
}

const route = useRoute()
const router = useRouter()
const {
	toggleScreenshare,
	hostRoom,
	leaveRoom,
	joinRoom,
	currentUsername,
	participantNames,
} = useLiveKit()

// URL param
const { username, room, isHost } = route.query as Partial<UrlParam>

// page data
const localVideo = ref<HTMLMediaElement | null>(null)
const chats = ref<ChatMessage[]>([])

// UI state
const chatIsOpen = ref(true)

onMounted(async () => {
	console.log(username)
	console.log(room)

	if (!username || !room) {
		router.push("/")
		return
	}

	try {
		if (isHost === "true") {
			await hostRoom(room.toString() ?? "", username.toString() ?? "")
		} else {
			if (localVideo.value) {
				await joinRoom(
					room.toString() ?? "",
					username.toString() ?? "",
					localVideo.value,
				)
			}
		}
	} catch {
		console.log("ERROR JOINING")
	}
})

const leave = async () => {
	await leaveRoom()
}

const screenshare = async () => {
	if (localVideo.value) {
		toggleScreenshare(localVideo.value)
	}
}

const handleToggleChat = () => {
	chatIsOpen.value = !chatIsOpen.value
}

provide("sendMessageSfu", () => {}) // TODO: implement
provide("handleToggleStreamSfu", screenshare)
provide("ToggleChatSfu", handleToggleChat)
provide("leaveRoomSfu", leave)

</script>
