import { JIKAN_API_BASE, GOGOANIME_BASE, INDOANIME_BASE, API_TIMEOUT, USER_AGENT } from "./sources";
import { getIndoAnimeStream } from "./indoanime";
import { normalizeTitle, generateSlug } from "./utils";
import type { RecentAnime, Anime, Episode, Stream } from "@/types/anime";

// Fetch with timeout
async function fetchWithTimeout(url: string): Promise<Response | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
            },
            next: { revalidate: 300 },
        });
        clearTimeout(timeout);

        if (!response.ok) {
            console.warn(`[Fetch] Failed: ${response.status} - ${url}`);
            return null;
        }

        return response;
    } catch (error) {
        clearTimeout(timeout);
        console.warn(`[Fetch] Error:`, error);
        return null;
    }
}

// ============================================
// JIKAN API FUNCTIONS
// ============================================

export async function fetchAllRecent(page: number = 1): Promise<{ results: RecentAnime[]; hasNextPage: boolean; currentPage: number }> {
    try {
        // Get current season anime with pagination
        const response = await fetchWithTimeout(`${JIKAN_API_BASE}/seasons/now?sfw=true&limit=24&page=${page}`);
        if (!response) return { results: [], hasNextPage: false, currentPage: page };

        const json = await response.json();
        const animeList = json.data || [];
        const pagination = json.pagination || {};

        const results: RecentAnime[] = animeList.map((anime: any) => ({
            title: anime.title || anime.title_english || "Unknown",
            slug: `${anime.mal_id}__${slugify(anime.title)}`,
            poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
            episode: anime.episodes ? `${anime.episodes} eps` : anime.status || "",
            type: anime.type || "TV",
            source: "MyAnimeList",
        }));

        console.log(`[Jikan API] Got ${results.length} anime (page ${page})`);
        return {
            results,
            hasNextPage: pagination.has_next_page || false,
            currentPage: page,
        };
    } catch (error) {
        console.error("[Jikan API] Error:", error);
        return { results: [], hasNextPage: false, currentPage: page };
    }
}

// Fetch recent schedule (anime airing today/this week)
export async function fetchRecentSchedule(): Promise<RecentAnime[]> {
    try {
        // Get today's schedule
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];

        const response = await fetchWithTimeout(`${JIKAN_API_BASE}/schedules/${today}?sfw=true&limit=12`);
        if (!response) return [];

        const json = await response.json();
        const animeList = json.data || [];

        const results: RecentAnime[] = animeList.map((anime: any) => ({
            title: anime.title || anime.title_english || "Unknown",
            slug: `${anime.mal_id}__${slugify(anime.title)}`,
            poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
            episode: anime.broadcast?.string || "Airing Today",
            type: anime.type || "TV",
            source: "Schedule",
        }));

        console.log(`[Jikan API] Got ${results.length} scheduled anime for ${today}`);
        return results;
    } catch (error) {
        console.error("[Jikan Schedule] Error:", error);
        return [];
    }
}

export async function searchAllSources(query: string): Promise<RecentAnime[]> {
    if (!query.trim()) return [];

    try {
        const response = await fetchWithTimeout(
            `${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&sfw=true&limit=20`
        );
        if (!response) return [];

        const json = await response.json();
        const animeList = json.data || [];

        return animeList.map((anime: any) => ({
            title: anime.title || anime.title_english || "Unknown",
            slug: `${anime.mal_id}__${slugify(anime.title)}`,
            poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
            episode: anime.episodes ? `${anime.episodes} eps` : "",
            type: anime.type || "TV",
            source: "MyAnimeList",
        }));
    } catch (error) {
        console.error("[Jikan Search] Error:", error);
        return [];
    }
}

export async function getAnimeDetail(slug: string): Promise<Anime | null> {
    try {
        // Extract MAL ID from slug (format: {malId}__{title-slug})
        const malId = slug.split("__")[0];

        const response = await fetchWithTimeout(`${JIKAN_API_BASE}/anime/${malId}/full`);
        if (!response) return null;

        const json = await response.json();
        const anime = json.data;

        if (!anime) return null;

        // Generate episodes based on episode count
        const episodes: Episode[] = [];
        const totalEpisodes = anime.episodes || 0;

        if (totalEpisodes > 0) {
            for (let i = 1; i <= Math.min(totalEpisodes, 500); i++) {
                episodes.push({
                    id: String(i),
                    slug: `${i}`,
                    number: String(i),
                    title: `Episode ${i}`,
                });
            }
        } else {
            // Ongoing anime - show up to 100 episodes
            for (let i = 1; i <= 50; i++) {
                episodes.push({
                    id: String(i),
                    slug: `${i}`,
                    number: String(i),
                    title: `Episode ${i}`,
                });
            }
        }

        return {
            id: slug,
            slug: slug,
            title: anime.title || anime.title_english || "Unknown",
            poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "",
            type: anime.type || "TV",
            status: anime.status || "Unknown",
            score: anime.score ? String(anime.score) : "",
            synopsis: anime.synopsis || "No synopsis available.",
            genres: anime.genres?.map((g: any) => g.name) || [],
            episodes,
            source: "MyAnimeList",
        };
    } catch (error) {
        console.error("[Jikan Detail] Error:", error);
        return null;
    }
}

export async function getStreamLinks(animeSlug: string, episodeSlug: string): Promise<Stream[]> {
    try {
        // Extract anime title from slug
        const titleSlug = animeSlug.split("__")[1] || "";
        const episodeNum = episodeSlug;
        const titleReadable = titleSlug.replace(/-/g, " ");

        const streams: Stream[] = [];

        // ============================================
        // PRIMARY: Try IndoAnime video extraction
        // This gets actual video embed URLs from base64 encoded options
        // ============================================
        const indoAnimeEpisodeSlug = `${titleSlug}-episode-${episodeNum}`;
        console.log(`[getStreamLinks] Trying IndoAnime: ${indoAnimeEpisodeSlug}`);

        try {
            const indoAnimeStreams = await getIndoAnimeStream(indoAnimeEpisodeSlug);
            if (indoAnimeStreams.length > 0) {
                console.log(`[getStreamLinks] Got ${indoAnimeStreams.length} streams from IndoAnime`);
                // Add IndoAnime streams first (highest priority)
                indoAnimeStreams.forEach(stream => {
                    streams.push({
                        ...stream,
                        provider: `🇮🇩 ${stream.provider}`,
                    });
                });
            }
        } catch (indoErr) {
            console.warn("[getStreamLinks] IndoAnime fetch failed:", indoErr);
        }

        // ============================================
        // FALLBACK: Static URL patterns for other sources
        // ============================================

        // Kuronime Direct
        const kuronimeUrl = `https://kuronime.moe/nonton-${titleSlug}-episode-${episodeNum}/`;
        streams.push({
            provider: "Kuronime",
            quality: "720p",
            url: kuronimeUrl,
            type: "embed",
        });

        // Gogoanime
        const gogoanimeUrl = `${GOGOANIME_BASE}/${titleSlug}-episode-${episodeNum}`;
        streams.push({
            provider: "Gogoanime",
            quality: "1080p",
            url: gogoanimeUrl,
            type: "embed",
        });

        // 9anime search
        const nineAnimeUrl = `https://9animetv.to/search?keyword=${encodeURIComponent(titleReadable)}`;
        streams.push({
            provider: "9Anime",
            quality: "1080p",
            url: nineAnimeUrl,
            type: "embed",
        });

        return streams;
    } catch (error) {
        console.error("[Stream Links] Error:", error);
        return [];
    }
}

// Helper function to create slug from title
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}
