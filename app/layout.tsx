import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pelėdnagių 2x2 lyga",
  description: "Draugų krepšinio turnyras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <header className="bg-[#0d0d0d] border-b border-border sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-tight">
                  <span className="text-white">Pelėdnagių</span>
                  <span className="bg-primary text-black px-2 py-0.5 rounded ml-1">2x2</span>
                </span>
              </Link>
              <div className="flex gap-1 text-sm font-medium">
                <Link href="/" className="px-4 py-2 rounded hover:bg-card-bg transition-colors text-text-muted hover:text-white">
                  Pradžia
                </Link>
                <Link href="/standings" className="px-4 py-2 rounded hover:bg-card-bg transition-colors text-text-muted hover:text-white">
                  Lentelė
                </Link>
                <Link href="/schedule" className="px-4 py-2 rounded hover:bg-card-bg transition-colors text-text-muted hover:text-white">
                  Rungtynės
                </Link>
                <Link href="/players" className="px-4 py-2 rounded hover:bg-card-bg transition-colors text-text-muted hover:text-white">
                  Žaidėjai
                </Link>
                <Link href="/wagers" className="px-4 py-2 rounded hover:bg-card-bg transition-colors text-text-muted hover:text-white">
                  Lažybos
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border mt-auto bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-text-muted">
            <span className="text-white font-bold">Pelėdnagių</span>
            <span className="text-primary font-bold ml-1">2x2</span>
            <span className="ml-2">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
