import { roomInfoMap } from "../../utils/roomManager"

export default defineEventHandler(async (event) => {
	// TODO: validate JWT or might not need to in the long term?
	const body = await readBody(event)

	roomInfoMap.set(body.roomName, body.usingServerSideStreaming)

	return {
		statusCode: 200
	}
})
