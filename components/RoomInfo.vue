<script setup lang="ts">
import { inject } from "vue"
import { type User } from "~/server/types"

defineProps<{
	roomName: string
	users: Array<User>
	username: string
	host: string
	isHost: string
}>()

type ToggleStreamFunction = () => void
type LeaveRoomFunction = () => void
type ToggleChat = () => void

const toggleStream = inject<ToggleStreamFunction>("handleToggleStream")
const leaveRoom = inject<LeaveRoomFunction>("leaveRoom")
const toggleChat = inject<ToggleChat>("ToggleChat")
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

			<RoomUserList :users="users" />
		</div>

		<div class="flex flex-row gap-5 pr-3">
			<Button @click="toggleChat" severity="secondary" outlined> Toggle Chat </Button>
			<Button v-if="isHost === 'true'" @click="toggleStream" outlined
				>Stream</Button
			>
			<Button @click="leaveRoom" severity="danger" outlined>Leave Room</Button>
		</div>
	</div>
</template>
