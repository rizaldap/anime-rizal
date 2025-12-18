// test-video-sources.ts - Test anime sites for video embed capability
const ANIME_SITES = [
    { name: "Anichin", url: "https://anichin.moe" },
    { name: "Kuramanime", url: "https://kuramanime.click" },
    { name: "Anikyojin", url: "https://anikyojin.cc" },
    { name: "Animasu", url: "https://animasu.cc" },
    { name: "Animeindo", url: "https://animeindo.bond" },
    { name: "Neonime", url: "https://neonime.fun" },
];

async function testVideoSources() {
    console.log("🎬 Testing anime sites for video embed...\n");
    console.log("=".repeat(60) + "\n");

    for (const site of ANIME_SITES) {
        try {
            const start = Date.now();
            const res = await fetch(site.url, {
                headers: { "User-Agent": "Mozilla/5.0" },
                signal: AbortSignal.timeout(8000),
            });
            const time = Date.now() - start;

            if (res.ok) {
                const html = await res.text();
                const hasAnime = html.includes("anime") || html.includes("episode");

                console.log(`✅ ${site.name}`);
                console.log(`   URL: ${site.url}`);
                console.log(`   Status: ${res.status} | Time: ${time}ms`);
                console.log(`   Has anime content: ${hasAnime ? "Yes" : "No"}\n`);
            } else {
                console.log(`⚠️ ${site.name} - HTTP ${res.status}\n`);
            }
        } catch (error: any) {
            console.log(`❌ ${site.name} - ${error.message}\n`);
        }
    }

    console.log("=".repeat(60));
    console.log("\n💡 Recommendation: Use sites that returned ✅");
}

testVideoSources();
