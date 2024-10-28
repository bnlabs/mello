import { expect, type Page } from "@playwright/test"
import { config } from "./E2eConfig"

type UserHostRoomResult = {
	usernameInput: string
	roomInput: string
}

export const UserHostRoom = async (page: Page): Promise<UserHostRoomResult> => {
	await page.goto(config.baseURL)

	await page.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')
	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100
	const usernameInput = "E2E-TEST-USERNAME" + randomThreeDigitNumber
	const roomInput = "E2E-TEST-ROOMNAME" + randomThreeDigitNumber

	// user fill in info to host room
	await page.locator("#hostroom-username").fill(usernameInput)
	await page.locator("#hostroom-room").fill(roomInput)

	// click host room button
	await page.locator('button[aria-label="Host Room"]').click()

	return { usernameInput, roomInput }
}

export const AssertRoomHosted = async (
	page: Page,
	username: string,
	room: string
) => {
	const expectedUrl = `${config.baseURL}room?username=${username}&room=${room}&isHost=true&serverSideStreaming=false`
	const response = await page.waitForResponse(
		(response) =>
			response.url().includes("/api/livekit/roomCheck") &&
			response.status() === 200
	)

	expect(response.status()).toBe(200)

	await expect(page).toHaveURL(expectedUrl)
	await expect(page.locator(`text=${username}`)).toBeVisible()
	await expect(page.locator(`text=${room}`)).toBeVisible()
}

export const QuickHostRoom = async (
	page: Page
): Promise<UserHostRoomResult> => {
	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100
	const usernameInput = "E2E-TEST-USERNAME" + randomThreeDigitNumber
	const roomInput = "E2E-TEST-ROOMNAME" + randomThreeDigitNumber

	await page.goto(
		`${config.baseURL}room?username=${usernameInput}&room=${roomInput}&isHost=true&serverSideStreaming=false`
	)

	return { usernameInput, roomInput }
}

export const AssertRoomJoined = async (
	page: Page,
	username: string,
	room: string
) => {
	const expectedUrl = `${config.baseURL}room?username=${username}&room=${room}&isHost=false&serverSideStreaming=false`
	const response = await page.waitForResponse(
		(response) =>
			response.url().includes("/api/livekit/roomCheck") &&
			response.status() === 200
	)

	expect(response.status()).toBe(200)

	await expect(page).toHaveURL(expectedUrl)
	await expect(page.locator(`text=${username}`)).toBeVisible()
	await expect(page.locator(`text=${room}`)).toBeVisible()
}
