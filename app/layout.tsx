import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FLAPPY CHAOS – One Tap. Infinite Chaos.',
  description:
    'The ultimate customized, crazy, addictive, and competitive arcade gaming web application. Custom characters, unpredictable random events, audio studio, and global leaderboards.',
  keywords: ['flappy bird', 'arcade', 'web game', 'flappy chaos', 'balayya flappy'],
  authors: [{ name: 'Flappy Chaos Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-rose-500 selection:text-white`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-65px)]">{children}</main>
      </body>
    </html>
  );
}
