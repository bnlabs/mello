<script setup lang="ts">
import { watch, nextTick } from "vue"

const messagesContainer = ref<HTMLElement | null>(null)
const scrollToBottom = () => {
	nextTick(() => {
		if (messagesContainer.value) {
			messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
		}
	})
}

const props = defineProps<{
	chats: ChatMessage[]
}>()

watch(() => props.chats, scrollToBottom, { deep: true })
</script>

<template>
	<div
		class="chat-container flex max-w-full flex-col overflow-y-auto bg-black p-2.5"
	>
		<div
			class="text-slate-30000 flex w-full flex-row justify-center border-b-2 border-solid border-slate-600 text-lg"
		>
			Room Chat
		</div>
		<ul
			ref="messagesContainer"
			class="hide-scrollbar flex-1 list-none overflow-y-auto p-0"
		>
			<li v-for="chat in chats" :key="chat.time" class="chat-message mb-3.5">
				<div class="message-header mb-1.5 flex justify-between">
					<span class="username font-bold text-gray-400">
						{{ chat.username }}
					</span>
					<span class="time text-[0.8rem] text-sm text-[#777]">
						{{ chat.time }}</span
					>
				</div>
				<p class="text m-0 text-white">{{ chat.text }}</p>
			</li>
		</ul>

		<div class="mt-auto w-full">
			<MessageEntry />
		</div>
	</div>
</template>

<style>
.hide-scrollbar::-webkit-scrollbar {
	display: none; /* Hide scrollbar for Webkit browsers */
}

.hide-scrollbar {
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
}
</style>
