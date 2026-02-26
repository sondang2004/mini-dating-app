import { test, expect } from '@playwright/test';

test.describe('Mini Dating App Matching Flow', () => {
  // Clear localStorage before each test
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER] ${msg.text()}`));
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should create two users and form a match', async ({ page }) => {
    // 1. Create User A
    await page.click('button:has-text("Create New Account")');

    // Step 1: Name & Email
    await page.fill('input[name="name"]', 'User A');
    await page.fill('input[name="email"]', 'userA@test.com');
    await page.click('button:has-text("Next Steps")');

    // Step 2: Age & Gender
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="gender"]', 'female');
    await page.click('button:has-text("Next Steps")');

    // Step 3: Bio
    await page.fill('textarea[name="bio"]', 'I am User A');
    await page.click('button:has-text("Join Now")');

    // Make sure we landed in the app
    await expect(page.getByText('Discover')).toBeVisible();

    // Logout via Profile tab
    await page.click('button:has-text("Profile")');
    await page.click('button:has-text("Logout")');

    // 2. Create User B
    await page.click('button:has-text("Create New Account")');

    // Step 1
    await page.fill('input[name="name"]', 'User B');
    await page.fill('input[name="email"]', 'userB@test.com');
    await page.click('button:has-text("Next Steps")');

    // Step 2
    await page.fill('input[name="age"]', '30');
    await page.selectOption('select[name="gender"]', 'male');
    await page.click('button:has-text("Next Steps")');

    // Step 3
    await page.fill('textarea[name="bio"]', 'I am User B');
    await page.click('button:has-text("Join Now")');

    // 3. User B likes User A (Swipe Right)
    await expect(
      page.getByRole('heading', { name: 'User A, 25' })
    ).toBeVisible();
    await page.getByTestId('swipe-right-btn').click({ force: true });

    // Wait for the card to unmount or animation to finish
    await page.waitForTimeout(500);

    // Logout via Profile tab
    await page.click('button:has-text("Profile")');
    await page.click('button:has-text("Logout")');

    // 4. Log back in as User A (Using the new Login UI)
    await page.click('button:has-text("User A")');

    // 5. User A likes User B (Swipe Right)
    await expect(
      page.getByRole('heading', { name: 'User B, 30' })
    ).toBeVisible();
    await page.getByTestId('swipe-right-btn').click({ force: true });

    // Wait for animation to start
    await page.waitForTimeout(500);

    // 6. Assert "It's a Match" alert
    await expect(page.locator("text=/It's a Match/")).toBeVisible();
  });
});
