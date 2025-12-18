import { fetchAllRecent, fetchRecentSchedule } from "@/lib/scraper";
import { AnimeCard, AnimeCardSkeleton } from "@/components/anime-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, Sparkles, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export const revalidate = 300; // 5 minutes

interface Props {
  searchParams: Promise<{ page?: string }>;
}

async function TodaySchedule() {
  const schedule = await fetchRecentSchedule();

  if (schedule.length === 0) return null;

  return (
    <section className="container mx-auto px-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Calendar className="w-6 h-6 text-green-500" />
          Tayang Hari Ini
        </div>
        <Badge variant="success">LIVE</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {schedule.slice(0, 12).map((anime) => (
          <AnimeCard key={anime.slug} anime={anime} />
        ))}
      </div>
    </section>
  );
}

async function AnimeGrid({ page }: { page: number }) {
  const { results: animeList, hasNextPage, currentPage } = await fetchAllRecent(page);

  if (animeList.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">Tidak ada anime ditemukan 😢</p>
        <p className="text-gray-500 text-sm mt-2">Coba refresh halaman atau cek koneksi internet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animeList.map((anime) => (
          <AnimeCard key={anime.slug} anime={anime} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-8">
        {currentPage > 1 && (
          <Link href={`/?page=${currentPage - 1}`}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
          </Link>
        )}

        <span className="text-gray-400">
          Page <span className="text-purple-400 font-bold">{currentPage}</span>
        </span>

        {hasNextPage && (
          <Link href={`/?page=${currentPage + 1}`}>
            <Button variant="default" className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function AnimeGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 18 }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1") || 1);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-2xl mx-auto">
            <Badge className="mb-4" variant="default">
              <Sparkles className="w-3 h-3 mr-1" />
              Multi-Source Streaming
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Nonton Anime Sub Indo
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Streaming dari sumber terpercaya. Kualitas HD, loading cepat, gratis selamanya! 🚀
            </p>
          </div>
        </div>
      </section>

      {/* Today's Schedule - Only on page 1 */}
      {currentPage === 1 && (
        <Suspense fallback={<AnimeGridSkeleton />}>
          <TodaySchedule />
        </Suspense>
      )}

      {/* Seasonal Anime Grid */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Flame className="w-6 h-6 text-orange-500" />
            Anime Musim Ini
          </div>
          <Badge variant="secondary">
            <TrendingUp className="w-3 h-3 mr-1" />
            ISR 5 menit
          </Badge>
        </div>

        <Suspense fallback={<AnimeGridSkeleton />}>
          <AnimeGrid page={currentPage} />
        </Suspense>
      </section>
    </div>
  );
}
