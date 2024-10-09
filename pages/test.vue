<template>
	<div class="m-8 flex flex-col items-center justify-center gap-5">
		<div class="flex flex-row items-center gap-2">
			<div class="m-5">username: {{ currentUsername }}</div>
			<div class="m-5">room: {{ room }}</div>
			<Button @click="host"> host room </Button>

			<Button @click="join"> join room </Button>

			<Button @click="leave" severity="danger"> disconnect </Button>

			<Button @click="screenshare" severity="secondary"> screenshare </Button>
		</div>

        <video
            autoPlay
            playsInline
            ref="localVideo"
            class= "w-5/6 bg-black rounded-lg"
            :muted="isHost === 'true'"
		/>

        <div class="flex flex-row gap-2">

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
const { toggleScreenshare, hostRoom, leaveRoom, joinRoom, currentUsername, currentRoom } =
	useLiveKit()

const { username, room, isHost } = route.query as Partial<UrlParam>
const localVideo = ref<HTMLMediaElement | null>(null)

const host = async () => {
	await hostRoom("t3", "broadcaster")
}

const leave = async () => {
	leaveRoom()
}

const screenshare = async () => {
	if (localVideo.value) {
		toggleScreenshare(localVideo.value)
	}
}

const join = async () => {
	if (localVideo.value) {
		await joinRoom("t3", "audience", localVideo.value)
	}
}
</script>
