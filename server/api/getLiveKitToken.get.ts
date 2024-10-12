import { AccessToken, ParticipantInfo } from "livekit-server-sdk"
import { livekitApiKey, livekitApiSecret, roomService } from "../utils/livekit"

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const room: string = query.room?.toString() ?? ""
	const username: string = query.username?.toString() ?? ""
	const canPublish: boolean = query.canPublish === "true"
	const canSubscribe: boolean = query.canSubscribe === "true"

	if (!room || !username) {
		return {
			statusCode: 400,
			message: "Must provide room and username",
		}
	}

	let res: ParticipantInfo[]
	let publishers: ParticipantInfo[] = []
	let participantNames: string[] = []
	// check if host already exist:
	try {
		res = await roomService.listParticipants(room)
		publishers = res.filter((participant) => participant.permission?.canPublish)


		participantNames = res.map((p) => p.name)
	} catch {
		// room doesnt exist so we can just continue to generate and return token
	}

	return {
		statusCode: 200,
		token: await createToken(room, username, canPublish, canSubscribe),
		host: publishers.length > 0 ? publishers[0].name : "",
		participantNames: participantNames,
	}
})

const createToken = async (
	room: string,
	username: string,
	canPublish: boolean,
	canSubscribe: boolean,
) => {
	const at = new AccessToken(livekitApiKey, livekitApiSecret, {
		identity: username,
		// Token to expire after 10 minutes,
		name: username,
		ttl: "10m",
	})
	at.addGrant({
		roomJoin: true,
		room: room,
		canPublish: canPublish,
		canSubscribe: canSubscribe,
	})

	const token = await at.toJwt()
	return token
}
