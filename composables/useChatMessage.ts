import moment from "moment"

const chatMessages = ref<ChatMessage[]>([])

export function useChatMessage() {
	const pushNotification = async (message: string) => {
		const msg: ChatMessage = {
			username: "Notification",
			text: message,
			time: moment().format("LT")
		}

		chatMessages.value.push(msg)
	}

	const clearMessages = () => {
		chatMessages.value = []
	}

	const pushMessage = async (msg: ChatMessage) => {
		chatMessages.value.push(msg)
	}

	return {
		pushNotification,
		clearMessages,
		chatMessages,
		pushMessage
	}
}
