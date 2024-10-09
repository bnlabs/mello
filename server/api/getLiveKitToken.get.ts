import { AccessToken } from "livekit-server-sdk"

export default defineEventHandler(async (event: any) => {

	const query = getQuery(event)
	const room:string = query.room?.toString() ?? ""
	const username = query.username?.toString() ?? ""
	const canPublish: boolean = query.canPublish === "true"
	const canSubscribe: boolean = query.canSubscribe === "true"

	if(!room || !username) {
		return {
			statusCode: 400,
			message: "must provide room and username"
		}
	}

	return {
		token: await createToken(room, username, canPublish, canSubscribe)
	}
})


const createToken = async (room: string, username: string, canPublish: boolean, canSubscribe: boolean) => {
	const at = new AccessToken(
		process.env.LIVEKIT_API_KEY,
		process.env.LIVEKIT_API_SECRET,
		{
			identity: username,
			// Token to expire after 10 minutes
			ttl: "10m",
		},
	)
	at.addGrant({ roomJoin: true, room: room , canPublish: canPublish, canSubscribe: canSubscribe })
	

	const token = await at.toJwt()
	return token
}
