import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RizalStream - Nonton Anime Sub Indo Terlengkap",
  description: "Streaming anime terbaru sub indo gratis! Kualitas HD, loading cepat, dari berbagai sumber terpercaya.",
  keywords: "anime, streaming, sub indo, nonton anime, anime terbaru, download anime",
  openGraph: {
    title: "RizalStream - Nonton Anime Sub Indo",
    description: "Streaming anime terbaru sub indo gratis selamanya!",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} min-h-screen antialiased`}>
        {/* Background Effects */}
        <div className="anime-grid-bg" />
        <div className="gradient-mesh" />
        <div className="spotlight" />
        <div className="vignette" />

        {/* Glowing Orbs */}
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />

        {/* Texture Overlays */}
        <div className="noise-overlay" />
        <div className="scan-line" />

        <Header />
        <main className="min-h-[calc(100vh-4rem)] pt-20">
          {children}
        </main>
        <footer className="border-t border-[var(--border-subtle)] py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[var(--text-secondary)] mb-2">🎬 RizalStream © 2025</p>
            <p className="text-xs text-[var(--text-muted)]">Untuk tujuan pembelajaran. Semua konten berasal dari sumber pihak ketiga.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
