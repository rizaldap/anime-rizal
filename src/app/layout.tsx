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
        {/* Noise overlay for texture */}
        <div className="noise-overlay" />

        <Header />
        <main className="min-h-[calc(100vh-4rem)]">
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
