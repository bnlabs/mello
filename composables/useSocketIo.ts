import { io, type Socket } from "socket.io-client"
import { onBeforeUnmount, ref } from "vue"

// This holds the singleton instance
let socketInstance: Socket | null = null

export function useSocketIo() {
	// Initialize the socket connection only if it hasn't been created yet
	if (!socketInstance) {
		socketInstance = io({
			path: "/api/socket.io",
			reconnection: true, // Enable reconnection
			reconnectionAttempts: 5, // Number of reconnection attempts
			reconnectionDelay: 1000, // Delay between reconnection attempts in milliseconds
			reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
			randomizationFactor: 0.5 // Randomization factor for the reconnection delay
		})
	}

	// Use a ref to make the instance reactive, if needed
	const socket = ref(socketInstance)

	onBeforeUnmount(() => {
		// Disconnect the socket when the component using this composable is unmounted
		// Consider whether you really want to disconnect every time a component unmounts
		// as it might affect other components using the same connection
		socket.value.disconnect()
		socketInstance = null // Reset the instance if you intend to allow reconnects later
	})

	return { socket: socket.value }
}
