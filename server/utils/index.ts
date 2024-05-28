import { Server, type ServerOptions, type Socket } from "socket.io"
import moment from "moment"
import type { H3Event } from "h3"
import type { User } from "../types"
import {
	userJoin,
	getRoomUsers,
	userLeave,
	isUsernameTaken,
	findHostInRoom,
	isRoomOccupied,
	roomExist,
} from "./users"
const options: Partial<ServerOptions> = {
	path: "/api/socket.io",
	serveClient: false,
}

export const io = new Server(options)

export function initSocket(event: H3Event) {
	// @ts-ignore
	io.attach(event.node.res.socket?.server)

	io.on("connection", (socket: Socket) => {
		// Join Room
		socket.on("joinRoom", async (payload: User) => {
			if (!isRoomValid(payload.room) || !isUsernameValid(payload.username)) {
				socket.emit("hostingOrJoiningFailed", {
					reason:
						"Invalid parameter: Username and Room must be between 1 and 30 characters long",
				})
			}
			const usernameTaken: boolean | undefined = await isUsernameTaken(
				payload.username,
				payload.room,
			)
			if (usernameTaken) {
				socket.emit("hostingOrJoiningFailed", {
					reason: "There is already a user with that name in this room.",
				})
				return
			}

			const roomAlreadyExist = await roomExist(payload.room)
			if (!roomAlreadyExist) {
				socket.emit("hostingOrJoiningFailed", {
					reason: "That Room does not exist",
				})
				return
			}

			const user = await userJoin({ ...payload, id: socket.id, isHost: false })
			socket.join(user.room)

			const host = await findHostInRoom(user.room)
			io.to(user.room).emit("userJoin", {
				room: user.room,
				users: await getRoomUsers(user.room),
				host: host?.username,
				newUser: user,
			})
		})

		// host Room
		socket.on("hostRoom", async (payload: User) => {
			if (!isRoomValid(payload.room) || !isUsernameValid(payload.username)) {
				socket.emit("hostingOrJoiningFailed", {
					reason:
						"Invalid parameter: Username and Room must be between 1 and 30 characters long",
				})
			}

			const roomOccupied = await isRoomOccupied(payload.room)
			if (!roomOccupied) {
				const user = await userJoin({ ...payload, id: socket.id, isHost: true })
				socket.join(user.room)

				io.to(user.room).emit("userJoin", {
					room: user.room,
					users: await getRoomUsers(user.room),
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
		socket.on("chatMessage", async (payload: string) => {
			const user = await getCurrentUser(socket.id)
			if (user) {
				io.to(user.room).emit("message", formatMessage(user.username, payload))
			}
		})

		// Disconnect
		socket.on("disconnect", async () => {
			const user = await userLeave(socket.id)
			if (user) {
				io.to(user.room).emit("userDisconnect", {
					room: user.room,
					users: await getRoomUsers(user.room),
					oldUser: user,
				})
			}
		})

		socket.on("sendWebRTCMessage", async (payload: string, uid: string) => {
			const user = await getCurrentUser(uid)
			const sender = await getCurrentUser(socket.id)
			io.to(user?.id ?? "").emit(
				"receiveWebRTCMessage",
				formatWebRTCResponse(sender?.username ?? "", payload, socket.id),
			)
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
