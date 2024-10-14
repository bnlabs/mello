import { AccessToken } from "livekit-server-sdk"
import {
	livekitApiKey,
	livekitApiSecret,
	roomService
} from "../../utils/livekit"

export default defineEventHandler(async (event) => {
	const query = getQuery(event)

	const room: string = query.room?.toString() ?? ""
	const username: string = query.username?.toString() ?? ""

	if (!room || !username) {
		return {
			statusCode: 400,
			message: "Must provide room and username"
		}
	}

	// check if room already exist
	const roomList = await roomService.listRooms()
	if (roomList.filter((r) => r.name === room).length > 0) {
		return {
			statusCode: 400,
			message: "Room already exist"
		}
	}

	// room does not exist yet, creating room
	await createRoom(room)

	const token = await createToken(room, username, true, true)

	return {
		statusCode: 200,
		result: "Room created",
		token: token
	}
})

const createToken = async (
	room: string,
	username: string,
	canPublish: boolean,
	canSubscribe: boolean
) => {
	const at = new AccessToken(livekitApiKey, livekitApiSecret, {
		identity: username,
		// Token to expire after 10 minutes,
		name: username,
		ttl: "10m"
	})
	at.addGrant({
		roomJoin: true,
		room: room,
		canPublish: canPublish,
		canSubscribe: canSubscribe,
		canPublishData: true
	})

	const token = await at.toJwt()
	return token
}

const createRoom = async (room: string) => {
	// create a new room
	const opts = {
		name: room,
		emptyTimeout: 5 * 60, // 10 minutes
		maxParticipants: 20
	}

	roomService.createRoom(opts)
}