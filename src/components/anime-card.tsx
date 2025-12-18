import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import type { RecentAnime } from "@/types/anime";

interface AnimeCardProps {
    anime: RecentAnime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
    return (
        <Link href={`/anime/${anime.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-xl bg-gray-900 aspect-[3/4] transition-all duration-300 group-hover:ring-2 group-hover:ring-purple-500 group-hover:shadow-xl group-hover:shadow-purple-500/20">
                {/* Poster */}
                {anime.poster ? (
                    <Image
                        src={anime.poster}
                        alt={anime.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                    </div>
                </div>

                {/* Episode badge */}
                {anime.episode && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="default" className="bg-purple-600/90 border-0">
                            {anime.episode}
                        </Badge>
                    </div>
                )}

                {/* Source badge */}
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-gray-800/90 text-xs">
                        {anime.source}
                    </Badge>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-semibold line-clamp-2 text-white group-hover:text-purple-300 transition-colors">
                        {anime.title}
                    </h3>
                    {anime.type && (
                        <span className="text-xs text-gray-400">{anime.type}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Skeleton version
export function AnimeCardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gray-900 aspect-[3/4] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-gray-900" />
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
        </div>
    );
}
