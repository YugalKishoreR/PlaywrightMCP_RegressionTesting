const fs = require("fs");
const path = require("path");

function generateReport(testName, testResults) {
  const timestamp = new Date().toLocaleString();
  const testOutputDir = path.join(__dirname, "test-outputs", testName);

  // Create test output directory if it doesn't exist
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  // Count results
  const passedCount = testResults.filter((t) => t.status === "passed").length;
  const failedCount = testResults.filter((t) => t.status === "failed").length;
  const skippedCount = testResults.filter((t) => t.status === "skipped").length;

  // Generate test cases HTML
  let testCasesHTML = "";
  testResults.forEach((test) => {
    const statusClass = test.status;
    const statusText =
      test.status.charAt(0).toUpperCase() + test.status.slice(1);

    let screenshotHTML = "";
    if (test.screenshots && test.screenshots.length > 0) {
      screenshotHTML = `
        <div class="screenshot-container">
          <h4>📸 Screenshots</h4>
          ${test.screenshots
            .map(
              (screenshot, index) => `
            <div>
              <p><strong>${
                screenshot.name || `Screenshot ${index + 1}`
              }</strong></p>
              <img src="${
                screenshot.path
              }" alt="Test screenshot" class="screenshot">
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    let errorHTML = "";
    if (test.error) {
      errorHTML = `
        <div class="error-message">${test.error}</div>
      `;
    }

    testCasesHTML += `
      <div class="test-case ${statusClass}">
        <div class="test-header">
          <div class="test-name">${test.name}</div>
          <span class="test-status ${statusClass}">${statusText}</span>
        </div>
        <div class="test-details">
          <p><span class="badge badge-duration">⏱️ ${
            test.duration || "N/A"
          }ms</span>
          <span class="badge badge-browser">🌐 ${
            test.browser || "Unknown"
          }</span></p>
        </div>
        ${screenshotHTML}
        ${errorHTML}
      </div>
    `;
  });

  // Read template
  const templatePath = path.join(
    __dirname,
    "test-outputs",
    "report-template.html"
  );
  let reportHTML = fs.readFileSync(templatePath, "utf8");

  // Replace placeholders
  reportHTML = reportHTML
    .replace("{TEST_NAME}", testName)
    .replace("{TIMESTAMP}", timestamp)
    .replace("{PASSED_COUNT}", passedCount)
    .replace("{FAILED_COUNT}", failedCount)
    .replace("{SKIPPED_COUNT}", skippedCount)
    .replace("{TEST_CASES}", testCasesHTML);

  // Write report
  const reportPath = path.join(testOutputDir, "report.html");
  fs.writeFileSync(reportPath, reportHTML);

  console.log(`✅ Report generated: ${reportPath}`);
  return reportPath;
}

module.exports = { generateReport };
