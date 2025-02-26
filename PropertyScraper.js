const puppeteer = require("puppeteer");

const ScrapePropertyImages = async (page) => {
  try {
    await page.waitForSelector('picture[data-cy="brochure-main-image"]', {
      timeout: 10000,
    });
    console.log("🧑‍💻 👉", "Found Swiper Image Container", "⬅️ 🛑");

    const imageSources = await page.evaluate(() => {
      const sources = [];

      const desktopImage = document.querySelector(
        ".gallery__main-image.d-none.d-lg-block"
      );
      if (desktopImage) {
        sources.push(desktopImage.src);
      }

      const mobileImages = document.querySelectorAll(
        ".gallery__main-image--mobile"
      );
      mobileImages.forEach((img) => {
        if (img.src && !sources.includes(img.src)) {
          sources.push(img.src);
        }
      });

      const pagingElement = document.querySelector(".paging-swiper");
      const totalImages = pagingElement
        ? parseInt(pagingElement.textContent.split("/")[1])
        : 0;
      return {
        sources,
        totalImages,
      };
    });

    if (imageSources.sources.length < imageSources.totalImages) {
      for (
        let i = imageSources.sources.length;
        i < imageSources.totalImages;
        i++
      ) {
        try {
          await page.evaluate(() => {
            const swiperContainer = document.querySelector("swiper-container");
            if (swiperContainer) {
              swiperContainer.swiper.slideNext();
            }
          });

          // Use a manual delay because page.waitForTimeout is throwing not a function
          await new Promise((resolve) => setTimeout(resolve, 500));

          const newSrc = await page.evaluate(() => {
            const newImage = document.querySelector(".swiper-slide-active img");
            return newImage ? newImage.src : null;
          });

          if (newSrc && !imageSources.sources.includes(newSrc)) {
            imageSources.sources.push(newSrc);
          }
        } catch (err) {
          console.log("Error moving to next slide:", err);
          break;
        }
      }
    }

    return imageSources.sources;
  } catch (error) {
    throw error;
  }
};

const ScrapePropertyDetails = async (page) => {
  try {
    const propertyDetails = await page.evaluate(() => {
      const titleEl = document.querySelector("h1.h4.fw-bold");
      const title = titleEl ? titleEl.textContent.trim() : null;

      const priceEl = document.querySelector(".brochure__price.p-1");
      const price = priceEl ? priceEl.textContent.trim() : null;

      const infoEls = Array.from(
        document.querySelectorAll(".info-strip--divider.p-1")
      );
      const infoDetails = infoEls
        .filter((el) => el.tagName.toLowerCase() !== "img")
        .map((el) => el.textContent.trim())
        .filter((text) => text.length > 0);

      const descriptionHeadingEls = Array.from(
        document.querySelectorAll(
          ".brochure__details--description-heading.mb-2"
        )
      );
      const descriptionContentEls = Array.from(
        document.querySelectorAll(".brochure__details--description-content")
      );

      const descriptions = [];
      const len = Math.min(
        descriptionHeadingEls.length,
        descriptionContentEls.length
      );
      for (let i = 0; i < len; i++) {
        const heading = descriptionHeadingEls[i].textContent.trim();
        const content = descriptionContentEls[i].textContent.trim();
        descriptions.push({ heading, content });
      }

      return { title, price, infoDetails, descriptions };
    });
    return propertyDetails;
  } catch (error) {
    throw error;
  }
};

const PropertyScraper = async (url) => {
  console.log("🧑‍💻👉", "Running scraper...", "⬅️🛑");

  const browser = await puppeteer.launch({
    channel: "chrome",
    headless: "new",
  });

  const page = await browser.newPage();
  console.log("🧑‍💻 👉", "Visiting Site...", "⬅️ 🛑");

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    console.log('\n🧑‍💻"👉', "Page loaded", "⬅️ 🛑");

    console.log("🧑‍💻 Scraping Property Details... ⬅️🛑");
    const propertyDetails = await ScrapePropertyDetails(page);
    console.log(
      "🧑‍💻PropertyDetails=>",
      JSON.stringify(propertyDetails, null, 2),
      "🛑"
    );

    console.log('\n🧑‍💻"👉', "Scraping Property Images", "⬅️ 🛑");
    const imageSources = await ScrapePropertyImages(page);
    console.log(
      "🧑‍💻 ImageSources=>",
      JSON.stringify(imageSources, null, 2),
      "🛑"
    );

    await browser.close();
    console.log("Total images found",imageSources.length)
    console.log("🧑‍💻👉", "Scraping Completed, Browser Closed...", "⬅️🛑");

    return {
      propertyDetails,
      imageSources,
    };
  } catch (error) {
    console.error("❌ ERROR 🧑‍💻 An error occurred=>", error, "🛑");
    await browser.close();
    throw error;
  }
};

PropertyScraper(
  "https://www.myhome.ie/residential/brochure/143-merrion-road-ballsbridge-dublin-4/4488726"
);
