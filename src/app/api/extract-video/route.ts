import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const episodeUrl = searchParams.get("url");

    if (!episodeUrl) {
        return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    try {
        // Fetch episode page
        const response = await fetch(episodeUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Try to find iframe video player
        const iframes: { src: string; title?: string }[] = [];

        $("iframe").each((_, el) => {
            const src = $(el).attr("src") || $(el).attr("data-src") || "";
            const title = $(el).attr("title") || "";

            if (src && src !== "about:blank" && !src.includes("disqus")) {
                iframes.push({ src, title });
            }
        });

        // Look for video player divs that might contain iframe info
        const playerDivs = $(".player, #player, .video-content, .embed-responsive");
        const playerData: any = {};

        playerDivs.each((_, el) => {
            const dataUrl = $(el).attr("data-url") || $(el).attr("data-src");
            if (dataUrl) {
                playerData.dataUrl = dataUrl;
            }
        });

        // Check script tags for video URLs
        const videoUrls: string[] = [];
        $("script").each((_, el) => {
            const scriptContent = $(el).html() || "";

            // Look for common video player patterns
            const patterns = [
                /src["\s:=]+["']([^"']+\.m3u8[^"']*)/gi,
                /file["\s:=]+["']([^"']+)/gi,
                /sources["\s:=]+\[["']([^"']+)/gi,
            ];

            patterns.forEach(pattern => {
                const matches = scriptContent.matchAll(pattern);
                for (const match of matches) {
                    if (match[1] && match[1].startsWith("http")) {
                        videoUrls.push(match[1]);
                    }
                }
            });
        });

        return NextResponse.json({
            success: true,
            iframes,
            playerData,
            videoUrls: [...new Set(videoUrls)],
            hasJavaScriptPlayer: iframes.length === 0 && videoUrls.length === 0,
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to extract video" },
            { status: 500 }
        );
    }
}
