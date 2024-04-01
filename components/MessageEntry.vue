<template>
	<div class="messaging-text-area flex flex-col items-end">
		<textarea
			v-model="message"
			ref="textarea"
			placeholder="Type your message here..."
			rows="3"
			class="text-area w-full mb-[10px] p-[8px] box-border rounded-[4px] border-[1px] border-solid border-[#ccc] bg-[#A3A1A1]"
			@keydown.enter.prevent="send"
			@keydown.exact="sendOnEnter"
		>
		</textarea>
		<button
			@click="send"
			class="send-button border-0 rounded-[4px] bg-[#007bff] text-[#FFFFFF] border-none py-1.5 px-3 hover:bg-[#0056b3]"
		>
			Send
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue"

const sendMessage = inject("sendMessage")
const message = ref("")
const textarea = ref(null)

const send = () => {
	if (sendMessage && message.value.trim()) {
		// Trim message to avoid sending just whitespace
		sendMessage(message.value)
		message.value = ""
	}
}

const sendOnEnter = (event) => {
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault() // Prevent adding a new line
		send()
	}
}

onMounted(() => {
	textarea.value.focus()
})
</script>
