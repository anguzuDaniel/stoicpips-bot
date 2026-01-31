import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { getAllDocs } from '@/lib/docs';
import MobileNav from '@/components/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stoicpips Documentation',
  description: 'Technical manual for the Stoicpips trading ecosystem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = getAllDocs();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-300 antialiased`}>
        <div className="flex min-h-screen isolation-auto">
          {/* Sidebar (Desktop) */}
          <aside className="fixed inset-y-0 left-0 z-[50] w-64 border-r border-white/5 bg-[#010816] px-4 py-6 overflow-y-auto hidden md:block shadow-2xl">
            <div className="mb-8 flex items-center space-x-2 px-2">
              <div className="h-8 w-8 rounded-full bg-cyan-900/40 flex items-center justify-center text-cyan-400 font-black border border-cyan-800/50">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase italic">Stoic</span>
            </div>

            <nav className="space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-900 hover:text-cyan-400 transition-colors text-slate-100"
              >
                Introduction
              </Link>

              <div className="pt-6 pb-2">
                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  The Ecosystem
                </p>
              </div>

              <Link
                href="/user-guide"
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-cyan-400 transition-colors"
              >
                Dunam AI Guide
              </Link>

              <div className="pt-6 pb-2">
                <p className="px-3 text-[10px] font-black text-cyan-500/70 uppercase tracking-[0.2em]">
                  Dunam AI Engine
                </p>
              </div>

              {docs.filter(d => d.slug !== 'user-guide').map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/${doc.slug}`}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-cyan-400 transition-colors capitalize"
                >
                  {doc.meta.title}
                </Link>
              ))}

              <div className="pt-8 mt-8 border-t border-slate-900">
                <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Future Tools
                </p>
                <div className="px-3 py-2 text-xs text-slate-500 italic">
                  More coming soon...
                </div>
              </div>
            </nav>
          </aside>

          {/* Fixed Header - ENFORCED OPACITY */}
          <header
            className="fixed top-0 left-0 right-0 z-[5000] flex h-16 items-center justify-between border-b border-white/5 px-4 md:px-8 shadow-2xl"
            style={{
              backgroundColor: '#020617', // Solid Slate-950
              opacity: 1
            }}
          >
            <div className="flex items-center md:hidden">
              <MobileNav docs={docs} />
              <span className="font-bold text-white ml-2 uppercase italic tracking-wider">Stoic Docs</span>
            </div>

            <div className="hidden md:block"></div>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:border-cyan-500/50 transition-all">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                  <span>v1.0.0-beta</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative z-0 flex-1 w-full md:pl-64 pt-20">
            <div className="mx-auto max-w-4xl px-4 py-12 md:px-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
