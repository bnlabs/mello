import { ParticipantInfo, Room, RoomServiceClient } from "livekit-server-sdk"

const livekitHost = process.env.LIVEKIT_WS_URL
export const livekitApiKey = process.env.LIVEKIT_API_KEY
export const livekitApiSecret = process.env.LIVEKIT_API_SECRET

if (!livekitHost) {
	throw new Error("no livekit server defined")
}

export const roomService = new RoomServiceClient(
	livekitHost,
	livekitApiKey,
	livekitApiSecret
)

export const roomExistInLiveKit = async (roomName: string) => {
	let roomExist: boolean = false

	await roomService.listRooms().then((rooms: Room[]) => {
		const res = rooms.filter((r) => r.name === roomName)
		roomExist = res.length !== 0
	})

	return roomExist
}

export const usernameTaken = async (name: string, roomName: string) => {
	const roomExist = await roomExistInLiveKit(roomName)
	if (!roomExist) {
		return false
	}

	const participants: ParticipantInfo[] =
		await roomService.listParticipants(roomName)
	const isTaken: boolean = participants.some(
		(participant) => participant.identity === name
	)

	return isTaken
}
