<template>
	<div class="flex flex-col w-full h-screen bg-black">

		<div class="w-full flex flex-row h-[90%]">
			<video
				autoPlay
				playsInline
				ref="localVideo"
				class= "w-5/6 bg-black"
				:muted="isHost === 'true'"
			/>
			
			<Chat class="w-1/6" :chats="[]"/>
		</div>

		<div class="Room-Info flex flex-row items-center justify-between pl-4 h-[10%]">
			<div class="flex h-full items-center gap-3">
				<RoomInfoSlot title="Room">
					<span class="text-black"> {{ room }}</span>
				</RoomInfoSlot>

				<RoomInfoSlot title="Username">
					<span class="text-black"> {{ currentUsername }}</span>
				</RoomInfoSlot>

				<RoomInfoSlot title="Host">
					<span class="text-black"> {{  }}</span>
				</RoomInfoSlot>

				<RoomUserList :users="[]" />
			</div>

			<div class="flex flex-row gap-5 pr-3">
				<Button severity="info" outlined> Hide Chat</Button>
				<Button v-if="isHost === 'true'" @click="screenshare" outlined>Stream</Button>
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
const { toggleScreenshare, hostRoom, leaveRoom, joinRoom, currentUsername, participantNames } = useLiveKit()

const { username, room, isHost } = route.query as Partial<UrlParam>
const localVideo = ref<HTMLMediaElement | null>(null)
const chats = ref<ChatMessage[]>([])

onMounted(async () => {
	console.log(username)
	console.log(room)

	if(!username || !room ) {
		router.push("/")
		return
	}

	try {
		if(isHost === "true"){
			await hostRoom(room.toString() ?? "", username.toString() ?? "")
		} else {
			if (localVideo.value) {
				await joinRoom(room.toString() ?? "", username.toString() ?? "", localVideo.value)
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
</script>
