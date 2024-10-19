import { useChatMessage } from "@/composables/useChatMessage"
import { describe, it, expect } from "vitest"

describe("useChatMessage", () => {
	it("pushNotification() add a notification message to chatMessages", async () => {
		const { pushNotification, chatMessages } = useChatMessage()

		pushNotification("notif")
		expect(chatMessages.value.length).toBe(1)
	})

	it("pushMessage() add a notification message to chatMessages", async () => {
		const { pushMessage, chatMessages } = useChatMessage()

		pushMessage({
			username: "test",
			text: "test",
			time: "1111"
		})
		expect(chatMessages.value.length).toBe(2)
	})

	it("clearMessage() should clear chatMessages", async () => {
		const { clearMessages, chatMessages } = useChatMessage()
		clearMessages()

		expect(chatMessages.value.length).toBe(0)
	})
})
