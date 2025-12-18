// Test Tondemo Skill de Isekai
import { getIndoAnimeStream } from "./src/lib/indoanime";

async function test() {
    console.log("Testing Tondemo Skill de Isekai Hourou Meshi...\n");

    // This is how Jikan slugifies the title
    const episodeSlug = "tondemo-skill-de-isekai-hourou-meshi-episode-1";
    console.log(`Episode slug: ${episodeSlug}`);
    console.log("=".repeat(60));

    const streams = await getIndoAnimeStream(episodeSlug);

    console.log(`\nFound ${streams.length} streams:\n`);

    streams.forEach((stream, i) => {
        console.log(`[${i + 1}] ${stream.provider}`);
        console.log(`    Quality: ${stream.quality}`);
        console.log(`    URL: ${stream.url.substring(0, 80)}...`);
        console.log("");
    });
}

test().catch(console.error);
