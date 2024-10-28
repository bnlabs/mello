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
	await expect(page.locator("text=E2E-TEST-ROOMNAME")).toBeVisible()
})
