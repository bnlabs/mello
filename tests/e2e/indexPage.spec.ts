import { test, expect } from "@playwright/test"

test("Page render correctly", async ({ page }) => {
	await page.goto("https://mello.bnlabsolutions.net/")

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Mello/)
})

test("Hostroom Tab", async ({ page }) => {
	await page.goto("https://mello.bnlabsolutions.net/")

	// Click the "Host Room" tab
	await page.click("text=Host Room")

	// Select the button using its aria-label
	const button = page.locator('button[aria-label="Host Room"]')

	// Assert that the button has the aria-label "Host Room"
	await expect(button).toHaveAttribute("aria-label", "Host Room")

	// Optionally, assert that the button is visible
	await expect(button).toBeVisible()
})
