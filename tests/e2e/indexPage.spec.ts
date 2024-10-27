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
	await page.click("text=Host Room")

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
	await page.click("text=Host Room")

	const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100

	// Select the button using its aria-label
	const button = page.locator('button[aria-label="Host Room"]')

	const usernameField = page.locator("#host-username")
	const roomField = page.locator("#host-room")

	await usernameField.fill("E2E-TEST" + randomThreeDigitNumber)
	await roomField.fill("E2E-TEST" + randomThreeDigitNumber)

	await button.click()

	// await page.pause()

	// Browser 2
	const page2 = await browser.newPage()
	await page2.goto(config.baseURL)
	const currentURL = page.url()

	// Click the "Host Room" tab
	await page2.click("text=Host Room")

	const usernameField2 = page2.locator("#host-username")
	const roomField2 = page2.locator("#host-room")

	await usernameField2.fill("E2E-TEST" + randomThreeDigitNumber)
	await roomField2.fill("E2E-TEST" + randomThreeDigitNumber)

	page2.locator('button[aria-label="Host Room"]').click()

	await expect(page2).toHaveURL(currentURL)
})
