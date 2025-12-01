import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("Successful login and capture post-login URL", async ({
  page,
  browser,
}, testInfo) => {
  const testName = "successful-login-test";
  const testOutputDir = path.join(__dirname, "..", "test-outputs", testName);

  // Create test output directory
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  let postLoginUrl = "";

  try {
    // Step 1: Navigate to login page
    console.log("Step 1: Opening login page...");
    await page.goto("https://the-internet.herokuapp.com/login");
    await page.waitForLoadState("networkidle");

    // Take screenshot of login page
    const loginPageScreenshot = path.join(testOutputDir, "01-login-page.png");
    await page.screenshot({ path: loginPageScreenshot, fullPage: true });
    console.log("✓ Login page loaded and screenshot taken");

    // Step 2: Enter username
    console.log('Step 2: Entering username "tomsmith"...');
    const usernameInput = page.locator("#username");
    await usernameInput.fill("tomsmith");
    await page.waitForTimeout(500);

    // Take screenshot after entering username
    const usernameScreenshot = path.join(
      testOutputDir,
      "02-username-entered.png"
    );
    await page.screenshot({ path: usernameScreenshot, fullPage: true });
    console.log("✓ Username entered");

    // Step 3: Enter correct password
    console.log('Step 3: Entering password "SuperSecretPassword!"...');
    const passwordInput = page.locator("#password");
    await passwordInput.fill("SuperSecretPassword!");
    await page.waitForTimeout(500);

    // Take screenshot after entering password
    const passwordScreenshot = path.join(
      testOutputDir,
      "03-password-entered.png"
    );
    await page.screenshot({ path: passwordScreenshot, fullPage: true });
    console.log("✓ Password entered");

    // Step 4: Click Login button
    console.log("Step 4: Clicking Login button...");
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    await page.waitForLoadState("networkidle");

    // Take screenshot after clicking login
    const afterLoginScreenshot = path.join(
      testOutputDir,
      "04-after-login-click.png"
    );
    await page.screenshot({ path: afterLoginScreenshot, fullPage: true });
    console.log("✓ Login button clicked");

    // Step 5: Capture post-login URL
    console.log("Step 5: Capturing post-login URL...");
    postLoginUrl = page.url();
    console.log("✓ Post-login URL captured:", postLoginUrl);

    // Wait for success message
    const successMessage = page.locator(".flash.success");
    await successMessage.waitFor({ timeout: 5000 });
    const message = await successMessage.textContent();

    // Take screenshot of success page
    const successScreenshot = path.join(testOutputDir, "05-success-page.png");
    await page.screenshot({ path: successScreenshot, fullPage: true });

    // Store results
    const testResults = {
      testName: "Successful Login Test",
      status: "passed",
      credentials: {
        username: "tomsmith",
        password: "SuperSecretPassword!",
      },
      postLoginUrl: postLoginUrl,
      successMessage: message?.trim() || "Login successful",
      screenshots: [
        { name: "Login Page", path: "01-login-page.png" },
        { name: "Username Entered", path: "02-username-entered.png" },
        { name: "Password Entered", path: "03-password-entered.png" },
        { name: "After Login Click", path: "04-after-login-click.png" },
        { name: "Success Page", path: "05-success-page.png" },
      ],
      timestamp: new Date().toLocaleString(),
    };

    // Save test results as JSON
    const resultsPath = path.join(testOutputDir, "results.json");
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));

    // Log the post-login URL
    console.log("\n========================================");
    console.log("✅ LOGIN SUCCESSFUL");
    console.log("========================================");
    console.log("Post-Login URL:", postLoginUrl);
    console.log("Success Message:", message?.trim());
    console.log("========================================\n");
  } catch (error) {
    console.error("Test failed:", error);

    // Take error screenshot
    const errorScreenshot = path.join(testOutputDir, "error-screenshot.png");
    await page.screenshot({ path: errorScreenshot, fullPage: true });

    throw error;
  }
});
