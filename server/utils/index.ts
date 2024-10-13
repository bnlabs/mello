import moment from "moment"

export function isUsernameValid(username: string) {
	return username.trim().length > 0 && username.trim().length <= 30
}

export function isRoomValid(room: string) {
	return room.trim().length > 0 && room.trim().length <= 30
}

export function formatMessage(username: string, text: string) {
	return {
		username,
		text,
		time: moment().utc().format("YYYY-MM-DDTHH:mm:ss")
	}
}

export function formatWebRTCResponse(
	username: string,
	payload: string,
	socketId: string
) {
	return {
		username,
		payload,
		socketId
	}
}
