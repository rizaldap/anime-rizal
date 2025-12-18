import { searchAllSources } from "@/lib/scraper";
import { AnimeCard, AnimeCardSkeleton } from "@/components/anime-card";
import { Badge } from "@/components/ui/badge";
import { Search, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const revalidate = 300; // 5 minutes

interface Props {
    searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
    if (!query) {
        return (
            <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Masukkan kata kunci untuk mencari anime</p>
            </div>
        );
    }

    const results = await searchAllSources(query);

    if (results.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-400 text-lg">Tidak ada hasil untuk "{query}" 😢</p>
                <p className="text-gray-500 text-sm mt-2">Coba kata kunci lain.</p>
            </div>
        );
    }

    return (
        <>
            <p className="text-gray-400 mb-6">
                Ditemukan <span className="text-purple-400 font-semibold">{results.length}</span> anime
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((anime) => (
                    <AnimeCard key={anime.slug} anime={anime} />
                ))}
            </div>
        </>
    );
}

function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default async function SearchPage({ searchParams }: Props) {
    const { q } = await searchParams;
    const query = q || "";

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
                    <span className="text-purple-300">Search</span>
                </div>
            </nav>

            <div className="container mx-auto px-4 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Search className="w-8 h-8 text-purple-400" />
                        Pencarian
                    </h1>
                    {query && (
                        <p className="text-gray-400 mt-2">
                            Hasil untuk: <span className="text-purple-400 font-semibold">"{query}"</span>
                        </p>
                    )}
                </div>

                {/* Results */}
                <Suspense fallback={<SearchResultsSkeleton />}>
                    <SearchResults query={query} />
                </Suspense>
            </div>
        </div>
    );
}
