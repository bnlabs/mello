import { Server, type ServerOptions, type Socket } from "socket.io"
import moment from "moment"
import type { H3Event } from "h3"
import type { User } from "../types"
import { userJoin, getRoomUsers, userLeave, roomExist } from "./users"
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

function isUsernameTaken(username: string, roomName: string) {
	return users.some(
		(user) => user.username === username && user.room == roomName,
	)
}

export function initSocket(event: H3Event) {
	// @ts-ignore
	io.attach(event.node.res.socket?.server)

	io.on("connection", (socket: Socket) => {
		// Join Room
		socket.on("joinRoom", (payload: User) => {
			if (!isRoomValid(payload.room) || !isUsernameValid(payload.username)) {
				socket.emit("hostingOrJoiningFailed", {
					reason:
						"Invalid parameter: Username and Room must be between 1 and 30 characters long",
				})
			}
			const usernameTaken = isUsernameTaken(payload.username, payload.room)
			if (usernameTaken) {
				socket.emit("hostingOrJoiningFailed", {
					reason: "There is already a user with that name in this room.",
				})
				return
			}

			if (!roomExist(payload.room)) {
				socket.emit("hostingOrJoiningFailed", {
					reason: "That Room does not exist",
				})
				return
			}

			const user = userJoin({ ...payload, id: socket.id, isHost: false })
			socket.join(user.room)

			socket.broadcast
				.to(user.room)
				.emit(
					"message",
					formatMessage(botName, `${user.username} has joined the chat`),
				)

			io.to(user.room).emit("userJoin", {
				room: user.room,
				users: getRoomUsers(user.room),
				host: findHostInRoom(user.room)?.username,
				newUser: user,
			})
		})

		// host Room
		socket.on("hostRoom", (payload: User) => {
			if (!isRoomValid(payload.room) || !isUsernameValid(payload.username)) {
				socket.emit("hostingOrJoiningFailed", {
					reason:
						"Invalid parameter: Username and Room must be between 1 and 30 characters long",
				})
			}

			const roomOccupied = isRoomOccupied(payload.room)
			if (!roomOccupied) {
				const user = userJoin({ ...payload, id: socket.id, isHost: true })
				socket.join(user.room)

				io.to(user.room).emit("userJoin", {
					room: user.room,
					users: getRoomUsers(user.room),
					host: user.username,
					newUser: user,
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
				io.to(user.room).emit("message", formatMessage(user.username, payload))
			}
		})

		// Disconnect
		socket.on("disconnect", () => {
			const user = userLeave(socket.id)
			if (user) {

				io.to(user.room).emit("userDisconnect", {
					room: user.room,
					users: getRoomUsers(user.room),
					oldUser: user
				})
			}
		})

		socket.on("sendWebRTCMessage", (payload: string, uid: string) => {
			const user = getCurrentUser(uid)
			const sender = getCurrentUser(socket.id)
			if (user && sender) {
				io.to(user.id).emit(
					"receiveWebRTCMessage",
					formatWebRTCResponse(sender.username, payload, socket.id),
				)
			}
		})

		return socket.id
	})
}

export function isUsernameValid(username: string) {
	return username.trim().length > 0 && username.trim().length <= 30
}

export function isRoomValid(room: string) {
	return room.trim().length > 0 && room.trim().length <= 30
}

export function formatMessage(username: string, text: string) {
	return {
		username,
		text,
		time: moment().utc().format("YYYY-MM-DDTHH:mm:ss"),
	}
}

export function formatWebRTCResponse(
	username: string,
	payload: string,
	socketId: string,
) {
	return {
		username,
		payload,
		socketId,
	}
}
