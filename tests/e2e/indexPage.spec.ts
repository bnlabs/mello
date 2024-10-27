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

test("Index page does not reroute when attempting to host a room if room name is taken", async ({
	page,
	browser
}) => {
	// Broswer 1
	await page.goto(config.baseURL)

	// Click the "Host Room" tab
	await page.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')

	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100

	// Select the button using its aria-label
	const button = page.locator('button[aria-label="Host Room"]')

	const usernameField = page.locator("#hostroom-username")
	const roomField = page.locator("#hostroom-room")

	await usernameField.fill("E2E-TEST" + randomThreeDigitNumber)
	await roomField.fill("E2E-TEST" + randomThreeDigitNumber)

	await button.click()

	// Browser 2
	const page2 = await browser.newPage()
	await page2.goto(config.baseURL)
	const currentURL = page2.url()

	// Click the "Host Room" tab
	await page2.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')

	const usernameField2 = page2.locator("#hostroom-username")
	const roomField2 = page2.locator("#hostroom-room")

	await usernameField2.fill("E2E-TEST" + randomThreeDigitNumber)
	await roomField2.fill("E2E-TEST" + randomThreeDigitNumber)

	page2.locator('button[aria-label="Host Room"]').click()

	await expect(page2).toHaveURL(currentURL)
})

test.only("Index Page won't reroute if username is taken", async ({
	page,
	browser
}) => {
	// Broswer 1
	await page.goto(config.baseURL)

	// Click the "Host Room" tab
	await page.click('a[role="tab"][aria-controls="pv_id_1_1_content"]')

	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100

	// Select the button using its aria-label
	const button = page.locator('button[aria-label="Host Room"]')

	const usernameField = page.locator("#hostroom-username")
	const roomField = page.locator("#hostroom-room")

	await usernameField.fill("E2E-TEST" + randomThreeDigitNumber)
	await roomField.fill("E2E-TEST" + randomThreeDigitNumber)

	await button.click()

    // Browser 2
	const page2 = await browser.newPage()
	await page2.goto(config.baseURL)
	const currentURL = page2.url()

	const usernameField2 = page2.locator("#joinroom-username")
	const roomField2 = page2.locator("#joinroom-room")

	await usernameField2.fill("E2E-TEST" + randomThreeDigitNumber)
	await roomField2.fill("E2E-TEST" + randomThreeDigitNumber)

	page2.locator('button[aria-label="Join Room"]').click()

	await expect(page2).toHaveURL(currentURL)

})
