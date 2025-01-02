const puppeteer = require("puppeteer");

async function viewPage(url) {
  let browser = null;

  try {
    console.log(`Opening page: ${url}`);
    browser = await puppeteer.launch({
      headless: "new", // Using new headless mode
    });

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    console.log("Page loaded successfully");
  } catch (error) {
    console.error("Error viewing page:", error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed");
    }
  }
}

async function runViewerLoop(url, iterations) {
  console.log(`Starting loop to view page ${iterations} times`);
  console.log("=".repeat(50));

  for (let i = 0; i < iterations; i++) {
    console.log("\n");
    console.log("*".repeat(20));
    console.log(`Run Count: ${i + 1} of ${iterations}`);
    console.log("*".repeat(20));

    await viewPage(url);
    if (i < iterations - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n");
  console.log("=".repeat(50));
  console.log(`Completed all ${iterations} runs`);
}

// Profile URL to view
const profileUrl = "https://github.com/tilakoli/";
const numberOfRuns = 1000;

setTimeout(() => {
  runViewerLoop(profileUrl, numberOfRuns);
}, 4000);
