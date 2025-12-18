// Test Tondemo Skill Season 2
import { getIndoAnimeStream } from "./src/lib/indoanime";

async function test() {
    console.log("Testing Tondemo Skill Season 2...\n");

    // This is how Jikan slugifies Season 2 (with -2)
    const episodeSlug = "tondemo-skill-de-isekai-hourou-meshi-2-episode-1";
    console.log(`Episode slug: ${episodeSlug}`);
    console.log("=".repeat(60));

    const streams = await getIndoAnimeStream(episodeSlug);

    console.log(`\nFound ${streams.length} streams:\n`);

    if (streams.length > 0) {
        streams.forEach((stream, i) => {
            console.log(`[${i + 1}] ${stream.provider}`);
            console.log(`    Quality: ${stream.quality}`);
            console.log(`    URL: ${stream.url.substring(0, 80)}...`);
            console.log("");
        });
    } else {
        console.log("NO STREAMS FOUND!");
    }
}

test().catch(console.error);
