<template>
	<div class="messaging-text-area flex flex-col items-end">
		<Textarea
			autofocus
			v-model="message"
			rows="2"
			cols="17"
			@keydown.enter.prevent="send"
			@keydown.exact="sendOnEnter"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, inject } from "vue"
import Textarea from "primevue/textarea"

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

onMounted(() => {})
</script>
