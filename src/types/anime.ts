// Anime Types
export interface AnimeSource {
    name: string;
    baseUrl: string;
    recentEndpoint: string;
    searchEndpoint?: string;
    detailEndpoint?: string;
    episodeEndpoint?: string;
}

export interface Anime {
    id: string;
    slug: string;
    title: string;
    poster: string;
    type?: string;
    status?: string;
    score?: string;
    synopsis?: string;
    genres?: string[];
    episodes?: Episode[];
    source: string;
    sourceUrl?: string;
}

export interface Episode {
    id: string;
    slug: string;
    number: string;
    title?: string;
    thumbnail?: string;
    releasedAt?: string;
}

export interface Stream {
    provider: string;
    quality: string;
    url: string;
    type: 'hls' | 'embed' | 'direct';
    icon?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    source: string;
}

export interface RecentAnime {
    title: string;
    slug: string;
    poster: string;
    episode?: string;
    type?: string;
    source: string;
}
