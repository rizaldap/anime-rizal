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
        <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Film className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
                            RizalStream
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Home
                        </Link>
                        <Link href="/bookmarks" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                            <Bookmark className="w-4 h-4" />
                            Bookmarks
                        </Link>
                    </nav>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 flex-1 max-w-sm mx-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari anime..."
                                className="pl-10 bg-gray-900/50"
                            />
                        </div>
                    </form>

                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-800 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari anime..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" size="icon">
                                <Search className="w-4 h-4" />
                            </Button>
                        </form>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="text-gray-300 hover:text-purple-400 py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <Link href="/bookmarks" className="text-gray-300 hover:text-purple-400 py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
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
