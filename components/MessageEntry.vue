<template>
	<div class="messaging-text-area flex flex-col items-end">
		<textarea
			v-model="message"
			ref="textarea"
			placeholder="Type your message here..."
			rows="3"
			class="text-area mb-[10px] box-border w-full rounded-[4px] border-[1px] border-solid border-[#ccc] bg-[#A3A1A1] p-[8px]"
			@keydown.enter.prevent="send"
			@keydown.exact="sendOnEnter"
		>
		</textarea>
		<button
			@click="send"
			class="send-button rounded-[4px] border-0 border-none bg-[#007bff] px-3 py-1.5 text-[#FFFFFF] hover:bg-[#0056b3]"
		>
			Send
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue"

type SendMessageFunction = (message: string) => void

const sendMessage = inject<SendMessageFunction>("sendMessage")
const message = ref("")
const textarea = ref(null)

const send = () => {
	if (sendMessage && message.value.trim()) {
		// Trim message to avoid sending just whitespace
		sendMessage(message.value)
		message.value = ""
	}
}

const sendOnEnter = (event: KeyboardEvent) => {
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault() // Prevent adding a new line
		send()
	}
}
</script>
