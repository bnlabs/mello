import { test, expect } from "@playwright/test"
import { config } from "./E2eConfig"
import {
	AssertRoomHosted,
	AssertRoomJoined,
	QuickHostRoom
} from "./HelperFunction"

test("User can join room", async ({ page, browser }) => {
	const { usernameInput, roomInput } = await QuickHostRoom(page)

	await AssertRoomHosted(page, usernameInput, roomInput)
	await page.waitForTimeout(4000)

	// User 2
	const page2 = await browser.newPage()
	const user2name = "user2"

	await page2.goto(
		`${config.baseURL}room?username=${user2name}&room=${roomInput}&isHost=false&serverSideStreaming=false`
	)

	// assert join successful
	await AssertRoomJoined(page2, user2name, roomInput)
})

test("User can send chat message in lobby", async ({ page, browser }) => {
	const { usernameInput, roomInput } = await QuickHostRoom(page)

	await AssertRoomHosted(page, usernameInput, roomInput)
	await page.waitForTimeout(6000)

	// User 2
	const page2 = await browser.newPage()
	const user2name = "user2"

	await page2.goto(
		`${config.baseURL}room?username=${user2name}&room=${roomInput}&isHost=false&serverSideStreaming=false`
	)

	// assert join successful
	await AssertRoomJoined(page2, user2name, roomInput)

	const messageEntry = page2.locator("#chat-message-input")

	// send chat message
	await messageEntry.fill("Hello world!")
	await page2.keyboard.press("Enter")

	await page2.waitForSelector('text="Hello world!"', { state: "visible" })

	// user 1 can see message from user 2
	const textLocator = page.locator('text="Hello world!"')
	await expect(textLocator).toBeVisible()
})
