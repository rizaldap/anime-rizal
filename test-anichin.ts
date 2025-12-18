// test-anichin.ts - Test Anichin episode structure
import * as cheerio from "cheerio";

async function testAnichin() {
    console.log("🔍 Testing Anichin...\n");

    try {
        // Homepage
        console.log("1️⃣ Testing homepage:");
        const homeRes = await fetch("https://anichin.moe/", {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const homeHtml = await homeRes.text();
        const $home = cheerio.load(homeHtml);

        // Get first anime
        const firstAnimeLink = $home("article a, .bsx a, .bs a").first().attr("href");
        console.log(`First anime: ${firstAnimeLink}\n`);

        if (firstAnimeLink) {
            // Get anime detail
            console.log("2️⃣ Getting anime detail:");
            const fullAnimeUrl = firstAnimeLink.startsWith("http") ? firstAnimeLink : `https://anichin.moe${firstAnimeLink}`;
            const animeRes = await fetch(fullAnimeUrl, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            const animeHtml = await animeRes.text();
            const $anime = cheerio.load(animeHtml);

            const title = $anime("h1, .entry-title").first().text();
            console.log(`Title: ${title}`);

            // Find episodes
            const firstEpLink = $anime(".eplister a, .lchx a, .lstepsdx a").first().attr("href");
            console.log(`First episode: ${firstEpLink}\n`);

            if (firstEpLink) {
                // Get episode page
                console.log("3️⃣ Getting episode page:");
                const fullEpUrl = firstEpLink.startsWith("http") ? firstEpLink : `https://anichin.moe${firstEpLink}`;
                const epRes = await fetch(fullEpUrl, {
                    headers: { "User-Agent": "Mozilla/5.0" }
                });
                const epHtml = await epRes.text();
                const $ep = cheerio.load(epHtml);

                console.log("🎬 Video player check:");

                // Check iframes
                const iframes = $ep("iframe");
                console.log(`iframes found: ${iframes.length}`);
                iframes.each((i, el) => {
                    const src = $ep(el).attr("src") || $ep(el).attr("data-src") || "";
                    if (src && src !== "about:blank") {
                        console.log(`  [${i}] ${src}`);
                    }
                });

                // Check video tags
                const videos = $ep("video");
                console.log(`\nvideo tags found: ${videos.length}`);
                videos.each((i, el) => {
                    const src = $ep(el).attr("src") || "";
                    console.log(`  [${i}] ${src}`);
                });

                // Check for player divs
                console.log("\n🔎 Player divs:");
                const playerSelectors = [".player", "#player", ".video-content", ".pframe"];
                playerSelectors.forEach(sel => {
                    const count = $ep(sel).length;
                    if (count > 0) {
                        console.log(`  ${sel}: ${count}`);
                        const dataUrl = $ep(sel).first().attr("data-url") || $ep(sel).first().attr("data-src");
                        if (dataUrl) console.log(`    data-url: ${dataUrl}`);
                    }
                });
            }
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testAnichin();
