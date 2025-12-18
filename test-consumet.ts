// test-consumet.ts - Test Consumet API endpoints
async function testConsumet() {
    console.log("🔥 Testing Consumet API...\n");

    const BASE = "https://api.consumet.org/anime/gogoanime";

    try {
        // Step 1: Get recent episodes
        console.log("1️⃣ Getting recent episodes...");
        const recentRes = await fetch(`${BASE}/recent-release`);
        if (recentRes.ok) {
            const recent = await recentRes.json();
            console.log(`✅ Got ${recent.results?.length || 0} recent episodes`);

            if (recent.results && recent.results[0]) {
                const firstEp = recent.results[0];
                console.log(`\nFirst episode: ${firstEp.title}`);
                console.log(`Episode ID: ${firstEp.id}\n`);

                // Step 2: Get anime info
                console.log("2️⃣ Getting anime info...");
                const animeId = firstEp.id.split('-episode-')[0]; // Extract anime ID
                const infoRes = await fetch(`${BASE}/info/${animeId}`);

                if (infoRes.ok) {
                    const info = await infoRes.json();
                    console.log(`✅ Title: ${info.title || "N/A"}`);
                    console.log(`   Episodes: ${info.episodes?.length || 0}`);
                    console.log(`   Release: ${info.releaseDate || "N/A"}`);

                    if (info.episodes && info.episodes[0]) {
                        const epId = info.episodes[0].id;
                        console.log(`\nFirst episode ID: ${epId}`);

                        // Step 3: Get streaming links
                        console.log("\n3️⃣ Getting streaming links...");
                        const streamRes = await fetch(`${BASE}/watch/${epId}`);

                        if (streamRes.ok) {
                            const streamData = await streamRes.json();
                            console.log(`✅ Got streaming data!\n`);

                            console.log("Headers:", streamData.headers || "None");
                            console.log("\n📺 Sources:");

                            if (streamData.sources && streamData.sources.length > 0) {
                                streamData.sources.forEach((source: any, i: number) => {
                                    console.log(`\n[${i + 1}] ${source.quality || "Unknown"}`);
                                    console.log(`    URL: ${source.url?.slice(0, 80) || "N/A"}`);
                                    console.log(`    Type: ${source.url?.includes('.m3u8') ? "HLS" : "Direct"}`);
                                });

                                console.log("\n✅ SUCCESS! Consumet API can provide direct streaming URLs");
                            } else {
                                console.log("⚠️ No sources found");
                            }

                            // Download links
                            if (streamData.download) {
                                console.log("\n💾 Download link:");
                                console.log(`   ${streamData.download}`);
                            }
                        } else {
                            console.log(`❌ Stream fetch failed: ${streamRes.status}`);
                        }
                    }
                } else {
                    console.log(`❌ Info fetch failed: ${infoRes.status}`);
                }
            }
        } else {
            console.log(`❌ Recent fetch failed: ${recentRes.status}`);
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testConsumet();
