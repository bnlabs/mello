import { roomExistInLiveKit } from "../utils/livekit"
import { roomExist } from "../utils/users"

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const roomName = query.roomName?.toString() ?? ""

	console.log("Received query:", query)
	console.log("roomName:", roomName)

	// Check if roomName is provided
	if (!roomName) {
		return {
			statusCode: 400,
			message: "roomName is required.",
		}
	}

	try {
		const re = await roomExist(roomName)
		const roomInLK = await roomExistInLiveKit(roomName)

		if (re) {
			return {
				statusCode: 200,
				roomExist: true,
				roomIsInLK: false,
			}
		} else if (roomInLK) {
			return {
				statusCode: 200,
				roomExist: true,
				roomIsInLK: true,
			}
		} else {
			return {
				statusCode: 404,
				message: "Room does not exist.",
			}
		}
	} catch (error) {
		console.error("Error:", error)
		return {
			statusCode: 500,
			message: "Internal server error.",
		}
	}
})
