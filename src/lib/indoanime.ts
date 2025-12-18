import { INDOANIME_BASE, API_TIMEOUT, USER_AGENT } from "./sources";
import type { RecentAnime, Anime, Episode, Stream } from "@/types/anime";
import * as cheerio from "cheerio";

// ============================================
// INDOANIME SCRAPER
// Website: https://indoanime.net
// Structure: WordPress-based anime fanshare site
// ============================================

// Fetch HTML with timeout
async function fetchHTML(url: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
            },
            next: { revalidate: 300 },
        });
        clearTimeout(timeout);

        if (!response.ok) {
            console.warn(`[IndoAnime] Failed: ${response.status} - ${url}`);
            return null;
        }

        return await response.text();
    } catch (error) {
        clearTimeout(timeout);
        console.warn(`[IndoAnime] Error:`, error);
        return null;
    }
}

// Helper: Create slug from URL
function extractSlugFromUrl(url: string): string {
    const match = url.match(/\/anime\/([^/]+)\/?/);
    return match ? match[1] : url.replace(/\/$/, "").split("/").pop() || "";
}

// Helper: Create episode slug from URL
function extractEpisodeSlug(url: string): string {
    // URL format: https://indoanime.net/anime-title-episode-1/
    const match = url.match(/\/([^/]+)\/?$/);
    return match ? match[1] : "";
}

// ============================================
// FETCH RECENT ANIME FROM HOMEPAGE
// ============================================
export async function fetchIndoAnimeRecent(page: number = 1): Promise<{ results: RecentAnime[]; hasNextPage: boolean }> {
    try {
        const url = page === 1 ? INDOANIME_BASE : `${INDOANIME_BASE}/page/${page}/`;
        const html = await fetchHTML(url);
        if (!html) return { results: [], hasNextPage: false };

        const $ = cheerio.load(html);
        const results: RecentAnime[] = [];

        // Parse anime cards from homepage
        $(".bsx, .bs, article.bs").each((_, el) => {
            const $el = $(el);
            const $link = $el.find("a").first();
            const $img = $el.find("img").first();
            const $title = $el.find(".tt, .title, h2").first();
            const $episode = $el.find(".epx, .ep, .episode").first();
            const $type = $el.find(".typez, .type").first();

            const href = $link.attr("href") || "";
            const title = $title.text().trim() || $img.attr("alt") || $img.attr("title") || "";
            const poster = $img.attr("src") || $img.attr("data-src") || "";
            const episode = $episode.text().trim();
            const type = $type.text().trim() || "TV";

            if (title && href) {
                results.push({
                    title,
                    slug: `indoanime__${extractSlugFromUrl(href)}`,
                    poster,
                    episode: episode || "Unknown",
                    type,
                    source: "IndoAnime",
                });
            }
        });

        // Check for next page
        const hasNextPage = $(".hpage .r, .pagination .next, a.next").length > 0;

        console.log(`[IndoAnime] Got ${results.length} anime (page ${page})`);
        return { results, hasNextPage };
    } catch (error) {
        console.error("[IndoAnime] fetchRecent error:", error);
        return { results: [], hasNextPage: false };
    }
}

// ============================================
// SEARCH ANIME
// ============================================
export async function searchIndoAnime(query: string): Promise<RecentAnime[]> {
    try {
        const url = `${INDOANIME_BASE}/?s=${encodeURIComponent(query)}`;
        const html = await fetchHTML(url);
        if (!html) return [];

        const $ = cheerio.load(html);
        const results: RecentAnime[] = [];

        // Parse search results
        $(".bsx, .bs, article.bs, .listupd .bsx").each((_, el) => {
            const $el = $(el);
            const $link = $el.find("a").first();
            const $img = $el.find("img").first();
            const $title = $el.find(".tt, .title, h2").first();
            const $type = $el.find(".typez, .type").first();

            const href = $link.attr("href") || "";
            const title = $title.text().trim() || $img.attr("alt") || "";
            const poster = $img.attr("src") || $img.attr("data-src") || "";
            const type = $type.text().trim() || "TV";

            if (title && href.includes("/anime/")) {
                results.push({
                    title,
                    slug: `indoanime__${extractSlugFromUrl(href)}`,
                    poster,
                    episode: "",
                    type,
                    source: "IndoAnime",
                });
            }
        });

        console.log(`[IndoAnime] Search "${query}" found ${results.length} results`);
        return results;
    } catch (error) {
        console.error("[IndoAnime] search error:", error);
        return [];
    }
}

// ============================================
// GET ANIME DETAIL
// ============================================
export async function getIndoAnimeDetail(slug: string): Promise<Anime | null> {
    try {
        // Extract actual slug from our format (indoanime__{slug})
        const actualSlug = slug.startsWith("indoanime__") ? slug.replace("indoanime__", "") : slug;
        const url = `${INDOANIME_BASE}/anime/${actualSlug}/`;
        const html = await fetchHTML(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        // Parse anime details
        const title = $(".entry-title, h1.entry-title").first().text().trim() ||
            $("h1").first().text().trim() || actualSlug;
        const poster = $(".thumb img, .thumbook img, .spe img").first().attr("src") || "";
        const synopsis = $(".entry-content p, .synp p, .sinopsis p").first().text().trim() ||
            $(".entry-content").first().text().trim() || "No synopsis available.";

        // Parse genres
        const genres: string[] = [];
        $(".genxed a, .genre-info a, .spe span:contains('Genre') a").each((_, el) => {
            genres.push($(el).text().trim());
        });

        // Parse status
        const statusText = $(".spe span:contains('Status')").text() || "";
        const status = statusText.toLowerCase().includes("ongoing") ? "Ongoing" :
            statusText.toLowerCase().includes("completed") ? "Completed" : "Unknown";

        // Parse score
        const score = $(".rating strong, .num, .score").first().text().trim() || "";

        // Parse episodes
        const episodes: Episode[] = [];
        $(".eplister ul li, .episodelist ul li, .bixbox.bxcl ul li").each((_, el) => {
            const $el = $(el);
            const $link = $el.find("a").first();
            const href = $link.attr("href") || "";
            const epNum = $el.find(".epl-num, .eps").text().trim() ||
                $link.text().match(/Episode\s*(\d+)/i)?.[1] || "";
            const epTitle = $el.find(".epl-title, .eptitle").text().trim() ||
                $link.text().trim() || `Episode ${epNum}`;

            if (href && epNum) {
                episodes.push({
                    id: epNum,
                    slug: extractEpisodeSlug(href),
                    number: epNum,
                    title: epTitle,
                });
            }
        });

        // Sort episodes by number
        episodes.sort((a, b) => parseInt(a.number) - parseInt(b.number));

        console.log(`[IndoAnime] Detail for "${title}" - ${episodes.length} episodes`);

        return {
            id: slug,
            slug: slug,
            title,
            poster,
            type: $(".spe span:contains('Type')").text().replace("Type", "").trim() || "TV",
            status,
            score,
            synopsis,
            genres,
            episodes,
            source: "IndoAnime",
            sourceUrl: url,
        };
    } catch (error) {
        console.error("[IndoAnime] getDetail error:", error);
        return null;
    }
}

// ============================================
// GET STREAM LINKS FROM EPISODE PAGE
// Decodes base64 encoded iframe tags from mirror options
// ============================================

// Helper: Decode base64 string (works in both browser and Node.js)
function decodeBase64(str: string): string {
    try {
        // Node.js environment
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(str, 'base64').toString('utf-8');
        }
        // Browser environment
        return atob(str);
    } catch {
        return '';
    }
}

// Helper: Extract iframe src from HTML string
function extractIframeSrc(html: string): string {
    const match = html.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : '';
}

// Helper: Determine quality from server name
function extractQuality(name: string): string {
    const qualityMatch = name.match(/(\d+)p/i);
    if (qualityMatch) return `${qualityMatch[1]}p`;
    if (name.toLowerCase().includes('1080')) return '1080p';
    if (name.toLowerCase().includes('720')) return '720p';
    if (name.toLowerCase().includes('480')) return '480p';
    if (name.toLowerCase().includes('360')) return '360p';
    return '720p';
}

export async function getIndoAnimeStream(episodeSlug: string): Promise<Stream[]> {
    try {
        // Parse the episode slug to get title and episode number
        // Format: "anime-title-episode-1" or "anime-title-episode-01"
        const episodeMatch = episodeSlug.match(/^(.+?)-episode-(\d+)$/i);
        const titleSlug = episodeMatch ? episodeMatch[1] : episodeSlug;
        const episodeNum = episodeMatch ? episodeMatch[2] : "1";

        // Handle season naming variations:
        // Jikan uses: "anime-title-2" (season 2)
        // IndoAnime uses: "anime-title-s2"
        const seasonMatch = titleSlug.match(/^(.+?)-(\d+)$/);
        const titleWithSeasonVariant = seasonMatch
            ? `${seasonMatch[1]}-s${seasonMatch[2]}`  // Convert "title-2" to "title-s2"
            : null;

        // Try multiple URL patterns since naming conventions vary
        const urlPatterns = [
            `${INDOANIME_BASE}/${episodeSlug}/`,                           // exact match
            `${INDOANIME_BASE}/${titleSlug}-episode-${episodeNum}/`,       // standard format
            `${INDOANIME_BASE}/${titleSlug}-episode-0${episodeNum}/`,      // with leading zero
            `${INDOANIME_BASE}/${titleSlug}-sub-indo-episode-${episodeNum}/`, // with sub-indo
        ];

        // Add season variant patterns if applicable (e.g., "title-s2" instead of "title-2")
        if (titleWithSeasonVariant) {
            urlPatterns.push(
                `${INDOANIME_BASE}/${titleWithSeasonVariant}-episode-${episodeNum}/`,
                `${INDOANIME_BASE}/${titleWithSeasonVariant}-episode-0${episodeNum}/`
            );
        }

        let html: string | null = null;
        let successUrl = "";

        // Try each URL pattern
        for (const url of urlPatterns) {
            console.log(`[IndoAnime] Trying: ${url}`);
            html = await fetchHTML(url);
            if (html && html.includes('select') && html.includes('mirror')) {
                successUrl = url;
                console.log(`[IndoAnime] Success: ${url}`);
                break;
            }
            html = null;
        }

        // If all patterns fail, try searching IndoAnime for anime page first
        if (!html) {
            console.log(`[IndoAnime] URL patterns failed, trying search...`);
            // Search for just the anime title (without episode number)
            const searchQuery = titleSlug.replace(/-/g, " ");
            const searchUrl = `${INDOANIME_BASE}/?s=${encodeURIComponent(searchQuery)}`;
            console.log(`[IndoAnime] Searching: ${searchQuery}`);
            const searchHtml = await fetchHTML(searchUrl);

            if (searchHtml) {
                const $search = cheerio.load(searchHtml);
                // Find link to anime page (not episode)
                const animePageLink = $search("a[href*='/anime/']").first().attr("href");

                if (animePageLink) {
                    console.log(`[IndoAnime] Found anime page: ${animePageLink}`);
                    // Now fetch the anime page to find episode links
                    const animePageHtml = await fetchHTML(animePageLink);

                    if (animePageHtml) {
                        const $anime = cheerio.load(animePageHtml);
                        // Extract slug pattern from anime page URL
                        const animeSlug = animePageLink.match(/\/anime\/([^/]+)/)?.[1] || titleSlug;

                        // Try to find episode link with various patterns
                        const episodePatterns = [
                            `episode-${episodeNum}`,
                            `episode-0${episodeNum}`,
                            `-${episodeNum}`,
                        ];

                        let episodeLink: string | undefined;
                        for (const pattern of episodePatterns) {
                            episodeLink = $anime(`a[href*='${pattern}']`).first().attr("href");
                            if (episodeLink) break;
                        }

                        // If still not found, construct URL based on anime slug
                        if (!episodeLink) {
                            // Try constructing URL from anime slug
                            const constructedUrl = `${INDOANIME_BASE}/${animeSlug}-episode-${episodeNum}/`;
                            console.log(`[IndoAnime] Trying constructed URL: ${constructedUrl}`);
                            html = await fetchHTML(constructedUrl);
                            if (html && html.includes('mirror')) {
                                successUrl = constructedUrl;
                            }
                        } else {
                            console.log(`[IndoAnime] Found episode link: ${episodeLink}`);
                            html = await fetchHTML(episodeLink);
                            successUrl = episodeLink;
                        }
                    }
                }
            }
        }

        if (!html) {
            console.log(`[IndoAnime] No page found for: ${episodeSlug}`);
            return [];
        }

        const $ = cheerio.load(html);
        const streams: Stream[] = [];
        const seenUrls = new Set<string>();

        // Helper: Check if URL is a valid video embed (not an image)
        const isValidVideoUrl = (url: string): boolean => {
            // Skip image URLs
            if (/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(url)) return false;
            // Skip WordPress uploads (images)
            if (url.includes('/wp-content/uploads/')) return false;
            // Skip emoji/assets
            if (url.includes('s.w.org') || url.includes('emoji')) return false;
            // Must be a video/embed URL
            return true;
        };

        // Method 1: Look for select.mirror with base64 encoded options (PRIMARY)
        $("select.mirror option").each((_, el) => {
            const $el = $(el);
            const base64Value = $el.attr("value") || "";
            const serverName = $el.text().trim();

            // Only process base64 encoded iframe values (they start with "PG" which is "<" in base64)
            if (base64Value && base64Value.length > 50 && base64Value.startsWith("PG")) {
                // Decode base64 to get iframe HTML
                const decodedHtml = decodeBase64(base64Value);
                if (decodedHtml && decodedHtml.includes("<iframe")) {
                    // Extract src from iframe tag
                    const iframeSrc = extractIframeSrc(decodedHtml);
                    if (iframeSrc && !seenUrls.has(iframeSrc) && isValidVideoUrl(iframeSrc)) {
                        seenUrls.add(iframeSrc);
                        const quality = extractQuality(serverName);
                        streams.push({
                            provider: serverName || "Server",
                            quality: quality,
                            url: iframeSrc,
                            type: "embed",
                        });
                    }
                }
            }
        });

        // Method 2: Check for existing iframe directly in page (fallback)
        if (streams.length === 0) {
            const mainIframe = $("iframe").first().attr("src") || "";
            if (mainIframe && !seenUrls.has(mainIframe) && isValidVideoUrl(mainIframe)) {
                seenUrls.add(mainIframe);
                streams.push({
                    provider: "IndoAnime Player",
                    quality: "720p",
                    url: mainIframe,
                    type: "embed",
                });
            }
        }

        // Fallback: embed the episode page itself
        if (streams.length === 0 && successUrl) {
            streams.push({
                provider: "IndoAnime (Page)",
                quality: "720p",
                url: successUrl,
                type: "embed",
            });
        }

        console.log(`[IndoAnime] Found ${streams.length} streams for ${episodeSlug}`);
        return streams;
    } catch (error) {
        console.error("[IndoAnime] getStream error:", error);
        return [];
    }
}

// ============================================
// SCHEDULE - Get Today's Anime
// ============================================
export async function fetchIndoAnimeSchedule(): Promise<RecentAnime[]> {
    try {
        // IndoAnime might have a schedule page, but for now
        // we'll return the latest releases as "today's anime"
        const { results } = await fetchIndoAnimeRecent(1);
        return results.slice(0, 12);
    } catch (error) {
        console.error("[IndoAnime] fetchSchedule error:", error);
        return [];
    }
}
