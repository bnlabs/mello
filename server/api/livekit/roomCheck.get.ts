import { roomExistInLiveKit } from "../../utils/livekit"
import { roomInfoMap } from "../../utils/roomManager"

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const roomName = query.roomName?.toString() ?? ""

	// Check if roomName is provided
	if (!roomName) {
		return {
			statusCode: 400,
			message: "roomName is required."
		}
	}

	try {
		const roomInLK = await roomExistInLiveKit(roomName)
		const usingServerSideStreaming: boolean = roomInfoMap.get(roomName) ?? false
		if (roomInLK) {
			return {
				statusCode: 200,
				roomExist: true,
				usingServerSideStreaming: usingServerSideStreaming,
				mesage: "Room exist"
			}
		} else {
			return {
				statusCode: 200,
				roomExist: false,
				message: "Room does not exist."
			}
		}
	} catch (error) {
		return {
			statusCode: 500,
			message: "Internal server error."
		}
	}
})
