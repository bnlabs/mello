<template>
	<div class="flex h-full items-center justify-between pl-4">
		<div class="flex h-full flex-row items-center gap-5">
			<div class="flex flex-row gap-2">
				<h2 class="font-bold text-slate-600">Room:</h2>
				<span class="text-white"> {{ roomName }}</span>
			</div>

			<div class="flex flex-row gap-2">
				<h2 class="font-bold text-slate-600">Username:</h2>
				<span class="text-white"> {{ username }}</span>
			</div>

			<div class="flex flex-row gap-2">
				<h2 class="font-bold text-slate-600">Host:</h2>
				<span class="text-white"> {{ host }}</span>
			</div>

			<div class="flex flex-row gap-2">
				<h2 class="font-bold text-slate-600">Users:</h2>
				<ul class="list-disc pl-[20px] text-white">
					<li v-for="user in users" :key="user.id">{{ user.username }}</li>
				</ul>
			</div>
		</div>

		<div class="flex flex-row gap-5 pr-3">
			<Button v-if="isHost === 'true'" @click="toggleStream" outlined
				>Stream</Button
			>
			<Button @click="leaveRoom" severity="danger" outlined>Leave Room</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject } from "vue"
import { type User } from "~/server/types"

const props = defineProps<{
	roomName: string
	users: Array<User>
	username: string
	host: string
	isHost: string
}>()

type ToggleStreamFunction = () => void
type LeaveRoomFunction = () => void

const toggleStream = inject<ToggleStreamFunction>("handleToggleStream")
const leaveRoom = inject<LeaveRoomFunction>("leaveRoom")
</script>
