"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Film, Menu, X, Home, Bookmark } from "lucide-react";

export function Header() {
    const [query, setQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setQuery("");
        }
    };

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
            <div className="glass-navbar rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                            <Film className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-lg font-bold text-white hidden sm:block">
                            RizalStream
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </Link>
                        <Link
                            href="/bookmarks"
                            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                            <Bookmark className="w-4 h-4" />
                            Bookmarks
                        </Link>
                    </nav>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-xs">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari anime..."
                                className="pl-10 bg-white/5 border-white/10 rounded-xl focus:border-white/30"
                            />
                        </div>
                    </form>

                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-xl hover:bg-white/5"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden pt-4 mt-3 border-t border-white/10 space-y-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari anime..."
                                    className="pl-10 bg-white/5 border-white/10 rounded-xl"
                                />
                            </div>
                            <Button type="submit" size="icon" className="rounded-xl bg-white text-black hover:bg-gray-200">
                                <Search className="w-4 h-4" />
                            </Button>
                        </form>
                        <nav className="flex flex-col gap-1">
                            <Link
                                href="/"
                                className="text-gray-400 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 flex items-center gap-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <Link
                                href="/bookmarks"
                                className="text-gray-400 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 flex items-center gap-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Bookmark className="w-4 h-4" />
                                Bookmarks
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
