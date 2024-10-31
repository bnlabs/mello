<script setup lang="ts">
import { ref, inject } from "vue"
import Textarea from "primevue/textarea"

type SendMessageFunction = (message: string) => void

const sendMessage = inject<SendMessageFunction>("sendMessage")
const message = ref("")

const send = () => {
	if (sendMessage && message.value.trim()) {
		sendMessage(message.value)
		message.value = ""
	}
}

const sendOnEnter = (event: KeyboardEvent) => {
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault()
		send()
	}
}
</script>

<template>
	<div class="messaging-text-area flex w-full flex-col items-end">
		<Textarea
			id="chat-message-input"
			class="w-full"
			autofocus
			v-model="message"
			rows="2"
			cols="17"
			@keydown.enter.prevent="send"
			@keydown.exact="sendOnEnter"
		/>
	</div>
</template>
