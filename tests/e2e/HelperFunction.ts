import type { Page } from "@playwright/test"
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
