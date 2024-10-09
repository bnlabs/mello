import moment from "moment"


const chatMessages = ref<ChatMessage[]>([])

export function useChatMessage() {
    const pushMessage = async (message: string) => {
        const msg:ChatMessage =  {
            username: "Notification",
            text: message,
            time: moment().utc().format("YYYY-MM-DDTHH:mm:ss")
        }
    
        chatMessages.value.push(msg)
    }

    const clearMessages = () => {
        chatMessages.value = [];
      };
    
    return {
        pushMessage,
        clearMessages,
        chatMessages
    }
}