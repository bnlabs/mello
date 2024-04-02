import { io, type Socket } from "socket.io-client"

export function useSocketIo() {
	const socket = io({
		path: "/api/socket.io",
	})

	onBeforeUnmount(() => {
		socket.disconnect()
	})

	return { socket }
}
