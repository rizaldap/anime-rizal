import { getAnimeDetail, getStreamLinks } from "@/lib/scraper";
import { HlsPlayer } from "@/components/player/hls-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Film,
    List
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ ep?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { ep } = await searchParams;
    const anime = await getAnimeDetail(slug);

    if (!anime) {
        return { title: "Episode Not Found" };
    }

    const episode = anime.episodes?.find((e) => e.slug === ep);
    const epTitle = episode ? `Episode ${episode.number}` : "Watch";

    return {
        title: `${anime.title} - ${epTitle} | RizalStream`,
        description: `Nonton ${anime.title} ${epTitle} sub indo di RizalStream`,
    };
}

export default async function WatchPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { ep } = await searchParams;

    const anime = await getAnimeDetail(slug);

    if (!anime) {
        notFound();
    }

    const episodes = anime.episodes || [];
    const currentEpSlug = ep || episodes[0]?.slug;
    const currentEpIndex = episodes.findIndex((e) => e.slug === currentEpSlug);
    const currentEpisode = episodes[currentEpIndex];

    const prevEpisode = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
    const nextEpisode = currentEpIndex < episodes.length - 1 ? episodes[currentEpIndex + 1] : null;

    // Get streams
    const streams = await getStreamLinks(slug, currentEpSlug || "");

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Link href="/" className="hover:text-white flex items-center gap-1">
                        <Home className="w-4 h-4" />
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href={`/anime/${slug}`} className="hover:text-white truncate max-w-[150px]">
                        {anime.title}
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white">
                        {currentEpisode ? `Episode ${currentEpisode.number}` : "Watch"}
                    </span>
                </div>
            </nav>

            <div className="container mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Player Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Player */}
                        <HlsPlayer streams={streams} />

                        {/* Episode Navigation */}
                        <div className="flex items-center justify-between gap-4">
                            {prevEpisode ? (
                                <Link href={`/watch/${slug}?ep=${prevEpisode.slug}`}>
                                    <Button variant="outline" className="gap-2">
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">Prev</span>
                                        <span className="sm:hidden">Ep {prevEpisode.number}</span>
                                    </Button>
                                </Link>
                            ) : (
                                <div />
                            )}

                            <div className="text-center">
                                <h1 className="font-bold text-lg">{anime.title}</h1>
                                <p className="text-white">
                                    Episode {currentEpisode?.number || "?"}
                                </p>
                            </div>

                            {nextEpisode ? (
                                <Link href={`/watch/${slug}?ep=${nextEpisode.slug}`}>
                                    <Button variant="default" className="gap-2">
                                        <span className="hidden sm:inline">Next</span>
                                        <span className="sm:hidden">Ep {nextEpisode.number}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <div />
                            )}
                        </div>

                        {/* Info Card */}
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
                            <h2 className="font-semibold mb-2 flex items-center gap-2">
                                <Film className="w-4 h-4 text-white" />
                                {anime.title}
                            </h2>
                            <p className="text-gray-400 text-sm line-clamp-3">
                                {anime.synopsis || "Sinopsis tidak tersedia."}
                            </p>
                            <Link href={`/anime/${slug}`} className="text-white text-sm hover:underline mt-2 inline-block">
                                Lihat detail →
                            </Link>
                        </div>
                    </div>

                    {/* Episode List Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 sticky top-20">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <List className="w-4 h-4 text-white" />
                                    Episode List
                                    <Badge variant="secondary">{episodes.length}</Badge>
                                </h3>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                                {episodes.map((episode, i) => (
                                    <Link
                                        key={episode.id}
                                        href={`/watch/${slug}?ep=${episode.slug}`}
                                        className={`block px-4 py-3 rounded-lg transition-all ${episode.slug === currentEpSlug
                                                ? "bg-gray-700 text-white"
                                                : "hover:bg-gray-800 text-gray-300"
                                            }`}
                                    >
                                        <span className="font-medium">Episode {episode.number}</span>
                                        {episode.title && episode.title !== `Episode ${episode.number}` && (
                                            <p className="text-sm opacity-70 truncate">{episode.title}</p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
