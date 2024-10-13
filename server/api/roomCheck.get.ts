import { roomExistInLiveKit } from "../utils/livekit"
import { roomInfoMap } from "../utils/roomManager"
import { roomExist } from "../utils/users"

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
		const re = await roomExist(roomName)
		const roomInLK = await roomExistInLiveKit(roomName)
		const usingServerSideStreaming: boolean = roomInfoMap.get(roomName) ?? false
		if (re) {
			return {
				statusCode: 200,
				roomExist: true,
				roomIsInLK: false,
				usingServerSideStreaming: usingServerSideStreaming
			}
		} else if (roomInLK) {
			return {
				statusCode: 200,
				roomExist: true,
				roomIsInLK: true,
				usingServerSideStreaming: usingServerSideStreaming
			}
		} else {
			return {
				statusCode: 200,
				roomExist: false,
				message: "Room does not exist."
			}
		}
	} catch (error) {
		console.error("Error:", error)
		return {
			statusCode: 500,
			message: "Internal server error."
		}
	}
})
