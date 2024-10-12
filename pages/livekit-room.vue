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

			<Chat
				v-if="chatIsOpen"
				:chats="chatMessages"
				:class="chatIsOpen ? 'w-1/6' : 'w-0'"
				:usingLiveKit="true"
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
					<span class="text-black"> {{ currentHost }}</span>
				</RoomInfoSlot>

				<RoomUserList :users="participantNames" />
			</div>

			<div class="flex flex-row gap-5 pr-3">
				<Button severity="info" @click="handleToggleChat" outlined>
					Hide Chat</Button
				>
				<Button v-if="isHost === 'true'" @click="screenshare" outlined
					>Stream</Button
				>
				<Button @click="leave" severity="danger" outlined>Leave Room</Button>
			</div>
		</div>
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
	sendMessageLiveKit
} = useLiveKit()

// URL param
const { username, room, isHost } = route.query as Partial<UrlParam>

// page data
const localVideo = ref<HTMLMediaElement | null>(null)
const { chatMessages, clearMessages } = useChatMessage()
const currentHost = ref<string>("")

// UI state
const chatIsOpen = ref(true)
const dialogVisible = useState<boolean>("diaglogVisible", () => false)
const failureMessage = useState<string>("failureMessage", () => "")

// Video element function
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
		if (isHost === "true") {
			// hosting room
			if (data.roomExist) {
				dialogVisible.value = true
				failureMessage.value = "Room already exist"
				return
			}

			await hostRoom(room.toString() ?? "", username.toString() ?? "")
			currentHost.value = username
		} else {
			// joining existing room
			if (!data.roomExist) {
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
			}
		}
	} catch (err: any) {
		dialogVisible.value = true
		failureMessage.value = err.toString()
	}

	window.addEventListener("keydown", adjustVolume)

	if (localVideo.value) {
		// Add click event listener to prevent play/pause
		localVideo.value.addEventListener("click", preventPlayPause)
	}
})

onBeforeUnmount(async () => {
	window.removeEventListener("keydown", adjustVolume)
	if (localVideo.value) {
		// Remove the click event listener
		localVideo.value.removeEventListener("click", preventPlayPause)
	}

	clearMessages()
	await leaveRoom()
})

const leave = async () => {
	await leaveRoom()
	router.push("/")
}

const screenshare = async () => {
	if (localVideo.value) {
		toggleScreenshare(localVideo.value)
	}
}

const handleToggleChat = () => {
	chatIsOpen.value = !chatIsOpen.value
}

provide("sendMessageSfu", sendMessageLiveKit)
provide("handleToggleStreamSfu", screenshare)
provide("ToggleChatSfu", handleToggleChat)
provide("leaveRoomSfu", leave)
</script>
