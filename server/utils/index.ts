import { Server, type ServerOptions, type Socket } from "socket.io"
import moment from "moment"
import type { H3Event } from "h3"
import type { User } from "../types"
import { userJoin, getRoomUsers, userLeave } from "./users"
const options: Partial<ServerOptions> = {
	path: "/api/socket.io",
	serveClient: false,
}

export const io = new Server(options)

const botName = "Notification"

function findHostInRoom(roomName: string): User | undefined {
	return users.find((user) => user.isHost === true && user.room === roomName)
}

function isRoomOccupied(roomName: string): boolean {
	return users.some((user) => user.room === roomName)
}

function isUsernameTaken(username: String, roomName: String) {
	return users.some((user) => user.username === username)
}

export function initSocket(event: H3Event) {
	// @ts-ignore
	io.attach(event.node.res.socket?.server)

	io.on("connection", (socket: Socket) => {
		// Join Room
		socket.on("joinRoom", (payload: User) => {
			const usernameTaken = isUsernameTaken(payload.username, payload.room)
			if (!usernameTaken) {
				const user = userJoin({ ...payload, id: socket.id, isHost: false })
				socket.join(user.room)

				socket.broadcast
					.to(user.room)
					.emit(
						"message",
						formnatMessage(botName, `${user.username} has joined the chat`),
					)

				io.to(user.room).emit("roomUsers", {
					room: user.room,
					users: getRoomUsers(user.room),
					host: findHostInRoom(user.room)?.username,
				})
			} else {
				socket.emit("hostingOrJoiningFailed", {
					reason: "There is already a user with that name in this room.",
				})
			}
		})

		// host Room
		socket.on("hostRoom", (payload: User) => {
			const roomOccupied = isRoomOccupied(payload.room)
			if (!roomOccupied) {
				const user = userJoin({ ...payload, id: socket.id, isHost: true })
				socket.join(user.room)

				socket.broadcast
					.to(user.room)
					.emit(
						"message",
						formnatMessage(botName, `${user.username} has joined the chat`),
					)

				io.to(user.room).emit("roomUsers", {
					room: user.room,
					users: getRoomUsers(user.room),
					host: user.username,
				})
			} else {
				socket.emit("hostingOrJoiningFailed", {
					reason: "Room name is already taken.",
				})
			}
		})

		// Handle Chat Message
		socket.on("chatMessage", (payload: string) => {
			const user = getCurrentUser(socket.id)
			if (user) {
				io.to(user.room).emit("message", formnatMessage(user.username, payload))
			}
		})

		// Disconnect
		socket.on("disconnect", () => {
			const user = userLeave(socket.id)
			if (user) {
				io.to(user.room).emit(
					"message",
					formnatMessage(botName, `${user.username} has left the chat`),
				)

				io.to(user.room).emit("roomUsers", {
					room: user.room,
					users: getRoomUsers(user.room),
				})
			}
		})

		socket.on("sendWebRTCMessage", (payload: string) => {
			const user = getCurrentUser(socket.id)
			if (user) {
				io.to(user.room).emit(
					"receiveWebRTCMessage",
					formnatMessage(user.username, payload),
				)
			}
		})

		return socket.id
	})
}

export function formnatMessage(username: string, text: string) {
	return {
		username,
		text,
		time: moment().format("h:mm a"),
	}
}
