// test-international.ts - Test international anime sites and APIs
const INTERNATIONAL_SOURCES = [
    // Official APIs
    { name: "Jikan (MyAnimeList API)", url: "https://api.jikan.moe/v4/top/anime?limit=5" },

    // Streaming sites
    { name: "Gogoanime", url: "https://anitaku.pe" },
    { name: "Zoro/Aniwatch", url: "https://aniwatch.to" },
    { name: "HiAnime", url: "https://hianime.to" },

    // Unofficial APIs
    { name: "Consumet Gogoanime API", url: "https://api.consumet.org/anime/gogoanime/recent-episodes" },
    { name: "Consumet Zoro API", url: "https://api.consumet.org/anime/zoro/recent-episodes" },
];

async function testInternational() {
    console.log("🌍 Testing international anime sources...\n");
    console.log("=".repeat(70) + "\n");

    const working: string[] = [];

    for (const source of INTERNATIONAL_SOURCES) {
        try {
            const start = Date.now();
            const res = await fetch(source.url, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json,text/html",
                },
                signal: AbortSignal.timeout(10000),
            });
            const time = Date.now() - start;

            if (res.ok) {
                const contentType = res.headers.get("content-type") || "";
                const isJson = contentType.includes("json");

                console.log(`✅ ${source.name}`);
                console.log(`   URL: ${source.url}`);
                console.log(`   Status: ${res.status} | Time: ${time}ms`);
                console.log(`   Type: ${isJson ? "JSON API" : "HTML Page"}`);

                if (isJson) {
                    const data = await res.json();
                    const count = data.results?.length || data.data?.length || data.length || "?";
                    console.log(`   Items: ${count}`);

                    // Show sample data
                    if (data.data && data.data[0]) {
                        console.log(`   Sample: ${data.data[0].title || data.data[0].mal_id || "N/A"}`);
                    } else if (data.results && data.results[0]) {
                        console.log(`   Sample: ${data.results[0].title || data.results[0].id || "N/A"}`);
                    }
                }

                console.log("");
                working.push(source.name);
            } else {
                console.log(`⚠️ ${source.name} - HTTP ${res.status}\n`);
            }
        } catch (error: any) {
            console.log(`❌ ${source.name}`);
            console.log(`   Error: ${error.message}\n`);
        }
    }

    console.log("=".repeat(70));
    console.log(`\n✅ Working sources: ${working.length}/${INTERNATIONAL_SOURCES.length}`);
    working.forEach(name => console.log(`   - ${name}`));

    console.log("\n💡 Recommendation:");
    console.log("   Use Jikan API for anime data (title, synopsis, genres, etc.)");
    console.log("   Then embed video from working streaming sites");
}

testInternational();
