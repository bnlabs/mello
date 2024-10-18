<script setup lang="ts">
import { inject } from "vue"

const props = defineProps<{
	roomName: string
	usernames: string[]
	username: string
	host: string
	isHost: string
	usingSFU: boolean
}>()

type ToggleStreamFunction = () => void
type LeaveRoomFunction = () => void
type ToggleChatFunction = () => void

let toggleStream: ToggleStreamFunction | undefined
let leaveRoom: LeaveRoomFunction | undefined
let toggleChat: ToggleChatFunction | undefined

leaveRoom = inject<LeaveRoomFunction>("leaveRoom")
toggleChat = inject<ToggleChatFunction>("ToggleChat")
toggleStream = inject<ToggleStreamFunction>("handleToggleStream")
</script>

<template>
	<div class="flex h-full items-center justify-between pl-4">
		<div class="flex h-full items-center gap-3">
			<RoomInfoSlot title="Room">
				<span class="text-black"> {{ roomName }}</span>
			</RoomInfoSlot>

			<RoomInfoSlot title="Username">
				<span class="text-black"> {{ username }}</span>
			</RoomInfoSlot>

			<RoomInfoSlot title="Host">
				<span class="text-black"> {{ host }}</span>
			</RoomInfoSlot>

			<RoomUserList :users="usernames" />
		</div>

		<div class="flex flex-row items-center gap-5 pr-3">
			<div v-if="usingSFU && isHost === 'true'">Server-side streaming</div>
			<div v-if="!usingSFU && isHost === 'true'">P2p streaming</div>
			<Button @click="toggleChat" severity="info" outlined> Hide Chat</Button>
			<Button v-if="isHost === 'true'" @click="toggleStream" outlined
				>Stream</Button
			>
			<Button @click="leaveRoom" severity="danger" outlined>Leave Room</Button>
		</div>
	</div>
</template>
