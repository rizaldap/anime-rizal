// Test script untuk IndoAnime video extraction
import { getIndoAnimeStream } from "./src/lib/indoanime";

async function test() {
    console.log("Testing IndoAnime stream extraction...\n");

    const episodeSlug = "naruto-shippuuden-episode-1";
    console.log(`Episode: ${episodeSlug}`);
    console.log("=".repeat(50));

    const streams = await getIndoAnimeStream(episodeSlug);

    console.log(`\nFound ${streams.length} streams:\n`);

    streams.forEach((stream, i) => {
        console.log(`[${i + 1}] ${stream.provider}`);
        console.log(`    Quality: ${stream.quality}`);
        console.log(`    URL: ${stream.url}`);
        console.log(`    Type: ${stream.type}`);
        console.log("");
    });
}

test().catch(console.error);
