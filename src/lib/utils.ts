import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Normalize anime title for deduplication
export function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// Generate slug from title
export function generateSlug(title: string, source: string): string {
    const normalized = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    return `${normalized}__${source.toLowerCase()}`;
}

// Parse slug to get title and source
export function parseSlug(slug: string): { title: string; source: string } {
    const parts = slug.split("__");
    const source = parts.pop() || "";
    const title = parts.join("__").replace(/-/g, " ");
    return { title, source };
}

// Format episode number
export function formatEpisode(episode: string | number): string {
    const num = typeof episode === "string" ? parseInt(episode) : episode;
    if (isNaN(num)) return String(episode);
    return `Episode ${num}`;
}

// Get provider icon name
export function getProviderIcon(provider: string): string {
    const lower = provider.toLowerCase();
    if (lower.includes("streamwish")) return "cloud";
    if (lower.includes("filemoon")) return "moon";
    if (lower.includes("dood")) return "play-circle";
    if (lower.includes("mp4upload")) return "upload";
    if (lower.includes("hls") || lower.includes("m3u8")) return "film";
    return "video";
}

// Truncate text
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
}

// Delay utility
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}
