// debug2.ts - Find anime detail structure
import * as cheerio from "cheerio";

async function findAnimeDetail() {
    console.log("🔍 Finding Kuronime anime detail page structure...\n");

    try {
        // Get homepage
        const res = await fetch("https://kuronime.moe/", {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        // Look for anime navigation or anime list page
        console.log("Looking for anime links...\n");

        // Check if there's a link to anime info in the episode page
        const firstEpisode = $("article a").first().attr("href");
        console.log(`First episode URL: ${firstEpisode}`);

        if (firstEpisode) {
            const epRes = await fetch(firstEpisode, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            const epHtml = await epRes.text();
            const $ep = cheerio.load(epHtml);

            // Look for link back to anime info
            const animeInfoLink = $ep("a[href*='/anime/']").first().attr("href");
            console.log(`Anime info link: ${animeInfoLink}\n`);

            if (animeInfoLink) {
                // Get anime detail page
                console.log("📄 Getting anime detail page...");
                const detailRes = await fetch(animeInfoLink, {
                    headers: { "User-Agent": "Mozilla/5.0" }
                });
                const detailHtml = await detailRes.text();
                const $detail = cheerio.load(detailHtml);

                const title = $detail("h1, .entry-title").first().text();
                console.log(`Title: ${title}`);

                // Find episode list
                console.log("\n🔎 Episode selectors:");
                console.log(".episodelist:", $detail(".episodelist").length);
                console.log(".eplister:", $detail(".eplister").length);
                console.log("#venkonten:", $detail("#venkonten").length);
                console.log(".bixbox .eplister:", $detail(".bixbox .eplister").length);

                const eps = $detail(".eplister ul li a, .episodelist a");
                console.log(`\nTotal episodes found: ${eps.length}`);

                if (eps.length > 0) {
                    console.log("\n✅ First 3 episodes:");
                    eps.slice(0, 3).each((i, el) => {
                        console.log(`  ${i + 1}. ${$detail(el).text().trim()} - ${$detail(el).attr("href")}`);
                    });
                }
            }
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

findAnimeDetail();
