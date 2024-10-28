import { test, expect } from "@playwright/test"
import { config } from "./E2eConfig"
import {
	AssertRoomHosted,
	AssertRoomJoined,
	QuickHostRoom
} from "./HelperFunction"

test("Host can stream to audience (P2p)", async ({ page, browser }) => {
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
