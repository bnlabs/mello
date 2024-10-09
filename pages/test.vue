<template>
	<div class="flex flex-col w-full">

		<div class="w-full flex flex-row">
			<video
				autoPlay
				playsInline
				ref="localVideo"
				class= "w-5/6 bg-black rounded-lg"
				:muted="isHost === 'true'"
			/>
			
			<div class="room-info flex flex-col items-center gap-2 border-2 border-solid border-[rgb(40,40,40)] w-1/6">
				<div class="flex flex-row gap-5 mt-5">
					<div class="">username: {{ currentUsername }}</div>
					<div class="">room: {{ room }}</div>
				</div>

				<div class="flex flex-row gap-2">
					<Button @click="screenshare" severity="secondary"> screenshare </Button>
					<Button @click="leave" severity="danger"> disconnect </Button>
				</div>
			</div>
		</div>

		<div class="Participants">
			Participants: {{ participantNames }}
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
