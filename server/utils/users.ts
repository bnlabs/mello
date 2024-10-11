import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
	PutCommand,
	DynamoDBDocumentClient,
	GetCommand,
	DeleteCommand,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb"

const client = new DynamoDBClient({
	region: "us-east-1",
})

const docClient = DynamoDBDocumentClient.from(client)

const connectedUserTable = "mello-connected-users"

// Join user to chat
export async function userJoin(user: User): Promise<User> {
	const command = new PutCommand({
		TableName: connectedUserTable,
		Item: {
			ID: user.id,
			username: user.username,
			room: user.room,
			isHost: user.isHost,
		},
	})

	await docClient.send(command)

	return user
}

// Get current usere
export async function getCurrentUser(id: string): Promise<User | undefined> {
	const command = new GetCommand({
		TableName: connectedUserTable,
		Key: {
			ID: id,
		},
	})

	try {
		const response = await docClient.send(command)
		if (response.Item) {
			// Map the DynamoDB item to a User type
			const user: User = {
				id: response.Item.ID,
				username: response.Item.username,
				room: response.Item.room,
				isHost: response.Item.isHost,
			}
			return user
		}

		return undefined
	} catch (error) {
		console.error("Error fetching data:", error)
		return undefined
	}
}

// User leaves chat
export async function userLeave(id: string): Promise<User | undefined> {
	const getCommand = new GetCommand({
		TableName: connectedUserTable,
		Key: {
			ID: id,
		},
	})

	const getResponse = await docClient.send(getCommand)

	const deleteCommand = new DeleteCommand({
		TableName: connectedUserTable,
		Key: {
			ID: id,
		},
	})

	try {
		await docClient.send(deleteCommand)
		if (getResponse.Item) {
			const user: User = {
				id: getResponse.Item.ID,
				username: getResponse.Item.username,
				room: getResponse.Item.room,
				isHost: getResponse.Item.isHost,
			}
			return user
		}
		return undefined
	} catch (error) {
		console.error("Error fetching data:", error)
		return undefined
	}
}

// Get room users
export async function getRoomUsers(room: string): Promise<User[] | undefined> {
	const params = new QueryCommand({
		TableName: connectedUserTable,
		IndexName: "RoomIndex",
		KeyConditionExpression: "room = :roomName",
		ExpressionAttributeValues: {
			":roomName": room,
		},
	})

	try {
		const { Items } = await docClient.send(params)
		if (Items) {
			// Map each item to a User object
			const users: User[] = Items.map((item) => ({
				id: item.ID, // Ensure that the DynamoDB attribute names match what is expected here
				username: item.username,
				room: item.room,
				isHost: item.isHost,
			}))
			return users
		}

		return undefined
	} catch (error) {
		console.error("Error fetching data:", error)
		return undefined
	}
}

export async function roomExist(room: string): Promise<boolean | undefined> {
	const res = await getRoomUsers(room)
	if (res) return res.length > 0
	return false
}

export async function findHostInRoom(
	roomName: string,
): Promise<User | undefined> {
	const command = new QueryCommand({
		TableName: connectedUserTable,
		IndexName: "RoomIndex",
		KeyConditionExpression: "room = :roomName",
		ExpressionAttributeValues: {
			":roomName": roomName,
		},
	})

	try {
		const { Items } = await docClient.send(command)
		// Filter the results to find where 'isHost' is true
		const hostItem = Items?.find((item) => item.isHost === true)

		if (hostItem) {
			const res: User = {
				id: hostItem.ID,
				username: hostItem.username,
				room: hostItem.room,
				isHost: hostItem.isHost,
			}

			return res
		} else {
			console.log("No host found in the specified room.")
			return undefined
		}
	} catch (error) {
		console.error("Error fetching data:", error)
		return undefined
	}
}

export async function isRoomOccupied(
	roomName: string,
): Promise<boolean | undefined> {
	return await roomExist(roomName)
}

export async function isUsernameTaken(
	username: string,
	roomName: string,
): Promise<boolean | undefined> {
	const command = new QueryCommand({
		TableName: connectedUserTable,
		IndexName: "RoomIndex",
		KeyConditionExpression: "room = :room",
		FilterExpression: "username = :username",
		ExpressionAttributeValues: {
			":room": roomName,
			":username": username,
		},
		Limit: 1, // We are checking for the existence of at least one item
	})

	try {
		const { Items } = await docClient.send(command)
		if (Items) return Items.length > 0
	} catch (error) {
		console.error("Error checking for user in room:", error)
		return undefined
	}
}
