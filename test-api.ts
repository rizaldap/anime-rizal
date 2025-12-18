// test-scrape.ts (taruh di root folder)

const TESTS = [
  // ✅ OFFICIAL APIs - Harusnya 100% work
  { name: "Jikan (MAL)", url: "https://api.jikan.moe/v4/seasons/now?limit=5" },
  { name: "AniList", url: "https://graphql.anilist.co", method: "POST", 
    body: JSON.stringify({ query: `{ Page(perPage:5) { media(type:ANIME,status:RELEASING) { id title { romaji } } } }` })
  },
  
  // 🇮🇩 INDONESIA SITES - Test bisa diakses atau tidak
  { name: "OtakuDesu", url: "https://otakudesu.cloud" },
  { name: "Samehadaku", url: "https://159.89.125.106" },
  { name: "Kusonime", url: "https://kusonime.com" },
  { name: "Kazefuri", url: "https://kazefuri.net" },
  { name: "Kuramanime", url: "https://kuramanime.dad" },
  { name: "Oploverz", url: "https://oploverz.city" },
  { name: "Nanime", url: "https://nanime.mom" },
  {name: "Kuronime", url: "https://kuronime.moe" },
  
  // 🌏 INTERNATIONAL
  { name: "Gogoanime", url: "https://gogoanimehd.io" },
  { name: "Zoro/Aniwatch", url: "https://aniwatch.to" },
  { name: "9anime", url: "https://9anime.to" },
  
  // 🔧 CONSUMET API
  { name: "Consumet Gogo", url: "https://api.consumet.org/anime/gogoanime/recent-episodes" },
  { name: "Consumet Zoro", url: "https://api.consumet.org/anime/zoro/recent-episodes" },
];

async function testAll() {
  console.log("🔍 TESTING ANIME SOURCES...\n");
  console.log("=".repeat(60) + "\n");

  const results: { name: string; status: string; time: number; info: string }[] = [];

  for (const test of TESTS) {
    const start = Date.now();
    
    try {
      const res = await fetch(test.url, {
        method: test.method || "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Content-Type": "application/json",
          "Accept": "text/html,application/json,*/*",
        },
        body: test.body,
        signal: AbortSignal.timeout(10000), // 10 detik timeout
      });

      const time = Date.now() - start;
      const contentType = res.headers.get("content-type") || "";
      
      if (res.ok) {
        const text = await res.text();
        const size = (text.length / 1024).toFixed(1);
        const isJson = contentType.includes("json");
        const isHtml = contentType.includes("html") || text.includes("<html");
        
        console.log(`✅ ${test.name}`);
        console.log(`   URL: ${test.url}`);
        console.log(`   Status: ${res.status} | Time: ${time}ms | Size: ${size}KB`);
        console.log(`   Type: ${isJson ? "JSON" : isHtml ? "HTML" : "Other"}`);
        
        // Preview content
        if (isJson) {
          try {
            const json = JSON.parse(text);
            const count = json.data?.length || json.results?.length || json.Page?.media?.length || "?";
            console.log(`   Items: ${count}`);
          } catch {}
        }
        
        console.log("");
        results.push({ name: test.name, status: "✅ OK", time, info: `${res.status}` });
      } else {
        console.log(`⚠️ ${test.name} - HTTP ${res.status}`);
        console.log(`   URL: ${test.url}\n`);
        results.push({ name: test.name, status: "⚠️ HTTP Error", time, info: `${res.status}` });
      }
    } catch (error: any) {
      const time = Date.now() - start;
      const msg = error.message || "Unknown error";
      
      console.log(`❌ ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Error: ${msg}\n`);
      results.push({ name: test.name, status: "❌ FAILED", time, info: msg.slice(0, 30) });
    }
  }

  // Summary
  console.log("=".repeat(60));
  console.log("\n📊 SUMMARY:\n");
  
  const working = results.filter(r => r.status.includes("✅"));
  const failed = results.filter(r => r.status.includes("❌"));
  
  console.log(`✅ Working: ${working.length}/${results.length}`);
  working.forEach(r => console.log(`   - ${r.name} (${r.time}ms)`));
  
  console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
  failed.forEach(r => console.log(`   - ${r.name}: ${r.info}`));
  
  console.log("\n" + "=".repeat(60));
  console.log("💡 Pakai yang ✅ untuk website kamu!");
}

testAll();