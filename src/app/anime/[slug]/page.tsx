import { getAnimeDetail } from "@/lib/scraper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
    Play,
    Bookmark,
    Star,
    Calendar,
    Film,
    ChevronRight,
    Home
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const anime = await getAnimeDetail(slug);

    if (!anime) {
        return { title: "Anime Not Found" };
    }

    return {
        title: `${anime.title} - RizalStream`,
        description: anime.synopsis || `Nonton ${anime.title} sub indo di RizalStream`,
        openGraph: {
            title: anime.title,
            description: anime.synopsis || "",
            images: anime.poster ? [anime.poster] : [],
        },
    };
}

export default async function AnimePage({ params }: Props) {
    const { slug } = await params;
    const anime = await getAnimeDetail(slug);

    if (!anime) {
        notFound();
    }

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Link href="/" className="hover:text-purple-400 flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-purple-300 truncate max-w-xs">{anime.title}</span>
                </div>
            </nav>

            {/* Hero Section with Blur Background */}
            <section className="relative overflow-hidden">
                {anime.poster && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={anime.poster}
                            alt=""
                            fill
                            className="object-cover opacity-20 blur-3xl scale-110"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />
                    </div>
                )}

                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Poster */}
                        <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/20">
                                {anime.poster ? (
                                    <Image
                                        src={anime.poster}
                                        alt={anime.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        priority
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
                                        <Film className="w-16 h-16 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {anime.title}
                            </h1>

                            {/* Meta badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {anime.score && (
                                    <Badge variant="default" className="gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        {anime.score}
                                    </Badge>
                                )}
                                {anime.status && (
                                    <Badge variant="secondary">{anime.status}</Badge>
                                )}
                                {anime.type && (
                                    <Badge variant="outline">{anime.type}</Badge>
                                )}
                                <Badge variant="secondary">{anime.source}</Badge>
                            </div>

                            {/* Genres */}
                            {anime.genres && anime.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {anime.genres.map((genre, i) => (
                                        <Badge key={i} variant="outline" className="bg-purple-600/10">
                                            {genre}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Synopsis */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-2 text-purple-300">Sinopsis</h3>
                                <p className="text-gray-300 leading-relaxed line-clamp-4 md:line-clamp-none">
                                    {anime.synopsis || "Sinopsis tidak tersedia."}
                                </p>
                            </div>

                            {/* Watch button */}
                            {anime.episodes && anime.episodes.length > 0 && (
                                <Link href={`/watch/${anime.slug}?ep=${anime.episodes[0].slug}`}>
                                    <Button size="lg" className="gap-2">
                                        <Play className="w-5 h-5" fill="white" />
                                        Mulai Nonton
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Episode List */}
            <section className="container mx-auto px-4 py-8">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Film className="w-6 h-6 text-purple-400" />
                        Daftar Episode
                        <Badge variant="secondary">{anime.episodes?.length || 0}</Badge>
                    </h2>

                    {anime.episodes && anime.episodes.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {anime.episodes.map((ep) => (
                                <Link
                                    key={ep.id}
                                    href={`/watch/${anime.slug}?ep=${ep.slug}`}
                                    className="bg-gray-800 hover:bg-purple-600 text-center py-3 px-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500 text-sm"
                                >
                                    {ep.number}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">
                            Belum ada episode tersedia 😢
                        </p>
                    )}
                </div>
            </section>

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "TVSeries",
                        name: anime.title,
                        description: anime.synopsis,
                        image: anime.poster,
                        genre: anime.genres,
                    }),
                }}
            />
        </div>
    );
}
