import { test, expect } from '@playwright/test';

test.describe('Bot Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to login page
        await page.goto('/login');

        // Perform login
        await page.getByPlaceholder('name@example.com').fill('syntoicai@gmail.com');
        await page.getByPlaceholder('••••••••').fill('password123'); // Placeholder - adjust if needed
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Wait for dashboard navigation
        await expect(page).toHaveURL('/', { timeout: 10000 });
    });

    test('should display balance on load and start the bot', async ({ page }) => {
        // 1. Verify Balance is displayed (Auto-Connect)
        // We look for the balance container in the header
        const balanceText = page.locator('header').getByText(/USD/);
        await expect(balanceText).toBeVisible({ timeout: 10000 });
        console.log('✅ Balance is visible');

        // 2. Verify "Start Bot" button is present and not currently running
        const startButton = page.getByRole('button', { name: /Start Bot|Connect & Start/ });
        await expect(startButton).toBeVisible();

        const isRunning = await page.getByText(/Stop Bot/).isVisible();
        if (isRunning) {
            console.log('ℹ️ Bot was already running, stopping it for test baseline...');
            await page.getByRole('button', { name: 'Stop Bot' }).click();
            await expect(page.getByRole('button', { name: 'Start Bot' })).toBeVisible({ timeout: 10000 });
        }

        // 3. Click Start Bot
        console.log('🖱️ Clicking Start Bot...');
        await page.getByRole('button', { name: 'Start Bot' }).click();

        // 4. Verify UI updates to "Stop Bot"
        await expect(page.getByRole('button', { name: 'Stop Bot' })).toBeVisible({ timeout: 15000 });
        console.log('✅ Bot is running');

        // 5. Verify Activity Log shows "Bot started"
        // Assuming ActivityLog has a specific container or text
        await expect(page.locator('body')).toContainText(/Bot started/i);
        console.log('✅ Activity log confirmed start');
    });

    test('should stop the bot when Stop Bot is clicked', async ({ page }) => {
        // Ensure bot is running first
        const stopButton = page.getByRole('button', { name: 'Stop Bot' });
        if (!(await stopButton.isVisible())) {
            await page.getByRole('button', { name: 'Start Bot' }).click();
            await expect(stopButton).toBeVisible({ timeout: 15000 });
        }

        console.log('🖱️ Clicking Stop Bot...');
        await stopButton.click();

        // Verify UI updates back to "Start Bot"
        await expect(page.getByRole('button', { name: 'Start Bot' })).toBeVisible({ timeout: 10000 });
        console.log('✅ Bot stopped successfully');
    });
});
