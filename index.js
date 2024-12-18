const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// async function scrapeWebsiteWithCheerio(url) {
//   try {
//     const {data} = await axios.get(url);
//     const $ = cheerio.load(data);

//     const iframes = [];
//     $("iframe").each((index, element) => {
//       const src = $(element).attr("src");
//       if (src) {
//         iframes.push(src);
//       }
//     });

//     console.log("Scraped iframe sources:", iframes);
//   } catch (error) {
//     console.error("Error fetching the page:", error.message);
//   }
// }

// scrapeWebsiteWithCheerio("https://ww4.fmovies.co/film/arcane-season-1-1630851919/");

// [-------------------------Puppetier------------------]

async function scrapeWebsiteWithPuppeteer(url) {
  try {
    console.log("Running scraper...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: "networkidle2"});

    const iframes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("iframe")).map(
        (iframe) => iframe.src
      );
    });
    console.log("iframes:", iframes);

    const dirPath = path.join(__dirname, "test");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    let sourceIndex = 0;
    const filePath = path.join(dirPath, "iframe_sources.txt");

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const matches = fileContent.match(/Source(\d+)=/g);
      if (matches) {
        sourceIndex = matches.length;
      }
    }
    const fileStream = fs.createWriteStream(filePath, {flags: "a"}); // 'a' for append
    iframes.forEach((iframeSrc, index) => {
      sourceIndex++;
      fileStream.write(`Source${sourceIndex}=${iframeSrc}\n`);
    });
    fileStream.end();
    await browser.close();
  } catch (error) {
    console.error("Error", error.message);
  }
}

scrapeWebsiteWithPuppeteer(""); // source url here
