import { type AnimeSource } from "@/types/anime";

// ============================================
// JIKAN API (MyAnimeList) - Official & Reliable
// ============================================
export const JIKAN_API_BASE = "https://api.jikan.moe/v4";

// Gogoanime for video embed
export const GOGOANIME_BASE = "https://anitaku.pe";

// ============================================
// INDOANIME - Indonesian Anime Fanshare
// ============================================
export const INDOANIME_BASE = "https://indoanime.net";

// Timeout for API requests (in ms)
export const API_TIMEOUT = 30000; // 30 seconds for slow sites like IndoAnime

// Revalidation time for ISR (in seconds)
export const REVALIDATE_TIME = 300; // 5 minutes

// User agent
export const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
