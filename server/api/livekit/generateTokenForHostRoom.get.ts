import { AccessToken, CreateOptions } from "livekit-server-sdk"
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
	const roomExist = await roomExistInLiveKit(room)
	if (roomExist) {
		throw createError({
			statusCode: 400,
			statusMessage: "Room already exist"
		})
	}

	// room does not exist yet, creating room
	await createRoom(room, username)

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

const createRoom = async (room: string, hostName: string) => {
	// create a new room
	const opts: CreateOptions = {
		name: room,
		emptyTimeout: 3 * 60, // 3 minutes
		maxParticipants: 20,
		metadata: JSON.stringify({
			host: hostName
		})
	}

	roomService.createRoom(opts)
}
