<script setup lang="ts">
import { inject } from "vue"
import { type User } from "~/server/types"
import InputSwitch from 'primevue/inputswitch'
import { ref, defineEmits } from 'vue';

defineProps<{
	roomName: string
	users: Array<User>
	username: string
	host: string
	isHost: string
}>()

type ToggleStreamFunction = () => void
type LeaveRoomFunction = () => void

const emit = defineEmits()
const toggleStream = inject<ToggleStreamFunction>("handleToggleStream")
const leaveRoom = inject<LeaveRoomFunction>("leaveRoom")

const switchValue = ref(false);

const handleSwitchChange = (newValue: boolean) => {
  switchValue.value = newValue;
  emit('update:modelValue', newValue); // Emitting the event to the parent
};

const toggleSwitch = () => {
  // Emit an event to notify the parent component about the change
  emit('switch-toggled', switchValue.value)
}
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
			<InputSwitch :modelValue="switchValue" @update:modelValue="handleSwitchChange" @change="toggleSwitch"/>
			<Button v-if="isHost === 'true'" @click="toggleStream" outlined
				>Stream</Button
			>
			<Button @click="leaveRoom" severity="danger" outlined>Leave Room</Button>
		</div>
	</div>
</template>
