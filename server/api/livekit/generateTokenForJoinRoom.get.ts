import { AccessToken, ParticipantInfo } from "livekit-server-sdk"
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

	// check if room exist
	const roomInLK = await roomExistInLiveKit(room)
	if (!roomInLK) {
		return {
			statusCode: 400,
			message: "Room does not exist"
		}
	}
	
	if(await usernameTaken(username, room)) {
		return {
			statusCode: 409,
			message: "Username is taken"
		}
	}

	// Room exist, generate token for join room
	const token = await createToken(room, username, false, true)

	const roomParticipantNames: string[] = (
		await roomService.listParticipants(room)
	).map((p: ParticipantInfo) => p.name)

	// host name, TODO: actually store host name
	const host: string =
		(await roomService.listParticipants(room)).filter(
			(participant: ParticipantInfo) => participant.permission?.canPublish
		)[0].name ?? "filler name"

	return {
		statusCode: 200,
		result: "Room exist, returning token",
		token: token,
		participantNames: roomParticipantNames,
		host: host
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

const usernameTaken = async (name: string, roomName: string) => {
	const participants: ParticipantInfo[] = await roomService.listParticipants(roomName)
	const isTaken:boolean  = participants.some(participant => participant.identity === name);

	return isTaken
}
