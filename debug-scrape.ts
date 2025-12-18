// debug-scrape.ts
import * as cheerio from "cheerio";

async function debugKuronime() {
    console.log("🔍 Testing Kuronime scraping...\n");

    // Test 1: Homepage
    console.log("1️⃣ Testing Homepage:");
    try {
        const res = await fetch("https://kuronime.moe/", {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        console.log("✅ Page loaded");

        // Find anime cards
        const cards = $("article").length;
        console.log(`Found ${cards} articles`);

        // Get first anime URL
        const firstLink = $("article a").first().attr("href");
        console.log(`First anime URL: ${firstLink}\n`);

        if (firstLink) {
            // Test 2: Detail page
            console.log("2️⃣ Testing Detail Page:");
            const detailRes = await fetch(firstLink, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            const detailHtml = await detailRes.text();
            const $detail = cheerio.load(detailHtml);

            const title = $detail("h1.entry-title").text();
            console.log(`Title: ${title}`);

            // Look for episode selectors
            console.log("\n🔎 Looking for episodes...");
            console.log("Selector .episodelist:", $detail(".episodelist").length);
            console.log("Selector .eplister:", $detail(".eplister").length);
            console.log("Selector .lstepsiode:", $detail(".lstepsiode").length);
            console.log("Selector #venkonten:", $detail("#venkonten").length);

            // Try different selectors
            const eps1 = $detail(".episodelist ul li a");
            const eps2 = $detail(".eplister ul li a");
            const eps3 = $detail("#venkonten .inepcx a");

            console.log(`\nEpisodes found:`);
            console.log(`- .episodelist ul li a: ${eps1.length}`);
            console.log(`- .eplister ul li a: ${eps2.length}`);
            console.log(`- #venkonten .inepcx a: ${eps3.length}`);

            // Show first episode if found
            if (eps2.length > 0) {
                const firstEp = eps2.first();
                console.log(`\n✅ First episode:`);
                console.log(`  URL: ${firstEp.attr("href")}`);
                console.log(`  Text: ${firstEp.text()}`);
            }
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

debugKuronime();
