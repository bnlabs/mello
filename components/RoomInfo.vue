<template>
	<div
		class="flex h-full items-center border-x-2 border-b-2 border-solid border-slate-500 pl-4"
	>
		<div class="flex h-full flex-row items-center gap-5 border-solid">
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

			<Button @click="toggleStream">Stream</Button>
			<Button @click="leaveRoom" severity="secondary">Leave Room</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue"

const props = defineProps<{
	roomName: string
	users: Array<User>
	username: string
	host: string
}>()

type ToggleStreamFunction = () => void
type LeaveRoomFunction = () => void

const toggleStream = inject<ToggleStreamFunction>("handleToggleStream")
const leaveRoom = inject<LeaveRoomFunction>("leaveRoom")
</script>
