import { test, expect } from "@playwright/test"
import { config } from "./E2eConfig"

test("Page render correctly", async ({ page }) => {
	await page.goto(config.baseURL)

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Mello/)
})

test("Hostroom Tab switch form", async ({ page }) => {
	await page.goto(config.baseURL)

	// Click the "Host Room" tab
	await page.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')

	// Select the button using its aria-label
	const button = page.locator('button[aria-label="Host Room"]')

	// Assert that the button has the aria-label "Host Room"
	await expect(button).toHaveAttribute("aria-label", "Host Room")

	// Optionally, assert that the button is visible
	await expect(button).toBeVisible()
})

test("Host room reroute page to /room", async ({ page }) => {
	await page.goto(config.baseURL)

	// Click the "Host Room" tab
	await page.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')

	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100

	// Select the button using its aria-label
	const button = page.locator('button[aria-label="Host Room"]')

	const usernameField = page.locator("#hostroom-username")
	const roomField = page.locator("#hostroom-room")

	const usernameInput = "E2E-TEST-USERNAME" + randomThreeDigitNumber
	const roomInput = "E2E-TEST-ROOMNAME" + randomThreeDigitNumber

	await usernameField.fill(usernameInput)
	await roomField.fill(roomInput)

	await button.click()

	const expectedUrl = `${config.baseURL}room?username=${usernameInput}&room=${roomInput}&isHost=true&serverSideStreaming=false`

	// Wait for the API response
	const response = await page.waitForResponse(
		(response) =>
			response.url().includes("/api/livekit/roomCheck") &&
			response.status() === 200
	)

	expect(response.status()).toBe(200)

	await expect(page).toHaveURL(expectedUrl)
	await expect(page.locator(`text=${usernameInput}`)).toBeVisible()
	await expect(page.locator(`text=${roomInput}`)).toBeVisible()
})

test("User can't host room if room name is taken", async ({
	page,
	browser
}) => {
	await page.goto(config.baseURL)

	// user 1 host a room

	// Click the "Host Room" tab
	await page.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')
	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100
	const usernameInput = "E2E-TEST-USERNAME" + randomThreeDigitNumber
	const roomInput = "E2E-TEST-ROOMNAME" + randomThreeDigitNumber

	// user fill in info to host room
	await page.locator("#hostroom-username").fill(usernameInput)
	await page.locator("#hostroom-room").fill(roomInput)

	// click host room button
	await page.locator('button[aria-label="Host Room"]').click()

	// assert user 1 host room successfully
	const expectedUrl = `${config.baseURL}room?username=${usernameInput}&room=${roomInput}&isHost=true&serverSideStreaming=false`
	const response = await page.waitForResponse(
		(response) =>
			response.url().includes("/api/livekit/roomCheck") &&
			response.status() === 200
	)
	expect(response.status()).toBe(200)
	await expect(page).toHaveURL(expectedUrl)

	await expect(page.locator(`text=${usernameInput}`)).toBeVisible()
	await expect(page.locator(`text=${roomInput}`)).toBeVisible()

	await page.waitForTimeout(4000)

	// user 2 attempting to host room with the same name and room
	const page2 = await browser.newPage()

	await page2.goto(config.baseURL)

	// click on host room tab
	await page2.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')

	// user fill in info to host room
	await page2.locator("#hostroom-username").fill("user2")
	await page2.locator("#hostroom-room").fill(roomInput)
	await page2.locator('button[aria-label="Host Room"]').click()
	const response2 = await page2.waitForResponse(
		(response) =>
			response.url().includes("/api/livekit/roomCheck") &&
			response.status() === 200
	)
	expect(response2.status()).toBe(200)

	await page2.waitForTimeout(1000)

	await expect(page2).toHaveURL(config.baseURL)
})

test("User can't join room if username is taken", async ({ page, browser }) => {
	await page.goto(config.baseURL)

	// user 1 host a room

	// Click the "Host Room" tab
	await page.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')
	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100
	const usernameInput = "E2E-TEST-USERNAME" + randomThreeDigitNumber
	const roomInput = "E2E-TEST-ROOMNAME" + randomThreeDigitNumber

	// user fill in info to host room
	await page.locator("#hostroom-username").fill(usernameInput)
	await page.locator("#hostroom-room").fill(roomInput)

	// click host room button
	await page.locator('button[aria-label="Host Room"]').click()

	// assert user 1 host room successfully
	const expectedUrl = `${config.baseURL}room?username=${usernameInput}&room=${roomInput}&isHost=true&serverSideStreaming=false`
	const response = await page.waitForResponse(
		(response) =>
			response.url().includes("/api/livekit/roomCheck") &&
			response.status() === 200
	)
	expect(response.status()).toBe(200)
	await expect(page).toHaveURL(expectedUrl)

	await expect(page.locator(`text=${usernameInput}`)).toBeVisible()
	await expect(page.locator(`text=${roomInput}`)).toBeVisible()

	await page.waitForTimeout(4000)

	// user 2 attempting to host room with the same name and room
	const page2 = await browser.newPage()

	await page2.goto(config.baseURL)

	// user fill in info to host room
	await page2.locator("#joinroom-username").fill(usernameInput)
	await page2.locator("#joinroom-room").fill(roomInput)
	await page2.locator('button[aria-label="Join Room"]').click()
	const response2 = await page2.waitForResponse(
		(response) =>
			response.url().includes("/api/livekit/roomCheck") &&
			response.status() === 200
	)
	expect(response2.status()).toBe(200)

	await page2.waitForTimeout(1000)

	await expect(page2).toHaveURL(config.baseURL)
})
