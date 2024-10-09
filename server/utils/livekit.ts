import { RoomServiceClient } from "livekit-server-sdk"

const livekitHost = process.env.LIVEKIT_WS_URL
export const livekitApiKey = process.env.LIVEKIT_API_KEY
export const livekitApiSecret = process.env.LIVEKIT_API_SECRET

if (!livekitHost) {
	throw new Error("no livekit server defined")
}

export const roomService = new RoomServiceClient(
	livekitHost,
	livekitApiKey,
	livekitApiSecret,
)
