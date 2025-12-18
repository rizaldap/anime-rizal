// debug-stream.ts - Test scraping video links
import * as cheerio from "cheerio";

async function testStreamScraping() {
    console.log("🎥 Testing video stream scraping...\n");

    // Get episode page from Kuronime
    const epUrl = "https://kuronime.moe/nonton-aru-hi-ohimesama-ni-natte-shimatta-ken-ni-tsuite-episode-14/";

    try {
        console.log(`Fetching: ${epUrl}\n`);
        const res = await fetch(epUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        console.log("✅ Page loaded\n");

        // Look for different video/download selectors
        console.log("🔎 Searching for video links...\n");

        const selectors = [
            ".download a",
            ".linkdl a",
            ".mirror a",
            ".smokeurl",
            ".player iframe",
            "iframe",
            ".anime__download a",
            ".misha a",
            "a[href*='drive']",
            "a[href*='mp4']",
            "a[href*='download']",
        ];

        selectors.forEach(selector => {
            const count = $(selector).length;
            console.log(`${selector}: ${count} found`);
        });

        // Show all links with "download" or video-related text
        console.log("\n📝 All download/stream links:\n");
        $("a").each((i, el) => {
            const $a = $(el);
            const href = $a.attr("href") || "";
            const text = $a.text().trim().toLowerCase();

            if (text.includes("download") || text.includes("nonton") ||
                text.includes("480") || text.includes("720") || text.includes("1080") ||
                text.includes("mkv") || text.includes("mp4")) {
                console.log(`  [${i}] ${text} -> ${href.slice(0, 80)}`);
            }
        });

        // Check for iframes
        console.log("\n🎬 iframes found:\n");
        $("iframe").each((i, el) => {
            const src = $(el).attr("src") || $(el).attr("data-src") || "";
            if (src) {
                console.log(`  [${i}] ${src}`);
            }
        });

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testStreamScraping();
