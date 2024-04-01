<template>
	<div
		class="chat-container flex max-w-full flex-col overflow-y-auto border-y-2 border-r-2 border-solid border-slate-500 bg-black p-2.5"
	>
		<ul class="flex-1 list-none overflow-y-auto p-0">
			<li v-for="chat in chats" :key="chat.time" class="chat-message mb-3.5">
				<div class="message-header mb-1.5 flex justify-between">
					<span class="username font-bold text-gray-400">
						{{ chat.username }}
					</span>
					<span class="time text-[0.8rem] text-sm text-[#777]">{{
						chat.time
					}}</span>
				</div>
				<p class="text m-0 text-white">{{ chat.text }}</p>
			</li>
		</ul>

		<div class="mt-auto">
			<MessageEntry />
		</div>
	</div>
</template>

<script setup lang="ts">
interface Chat {
	username: string
	text: string
	time: string
	room?: string
}

// Using defineProps to define the component's props
const props = defineProps<{
	chats: Chat[]
}>()
</script>
