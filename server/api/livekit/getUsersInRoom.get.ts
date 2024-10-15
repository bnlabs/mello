import { ParticipantInfo } from "livekit-server-sdk"
import { roomService } from "../../utils/livekit"

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const roomName = query.roomName?.toString() ?? ""

	const res: ParticipantInfo[] = await roomService.listParticipants(roomName)

	return {
		result: res,
		statusCode: 200
	}
})
