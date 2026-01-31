'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Doc } from '@/lib/docs';

interface MobileNavProps {
    docs: Doc[];
}

export default function MobileNav({ docs }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <button
                onClick={toggleMenu}
                className="p-2 -ml-2 text-slate-400 hover:text-cyan-400 md:hidden transition-colors"
                id="mobile-menu-trigger"
                aria-label="Toggle mobile menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Global Portal-like Container */}
            {isOpen && (
                <>
                    {/* Opaque Overlay - Darker and more solid */}
                    <div
                        className="fixed inset-0 z-[10000] bg-black/90 md:hidden"
                        onClick={closeMenu}
                    />

                    {/* Sidebar Drawer - Solid Background */}
                    <div
                        className={`
                            fixed inset-y-0 left-0 z-[10001] w-72 p-6 md:hidden shadow-[40px_0_100px_rgba(0,0,0,1)]
                            transform transition-transform duration-300 ease-in-out
                            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}
                        style={{
                            backgroundColor: '#020617', // Enforce solid opaque background
                            borderRight: '1px solid rgba(6, 182, 212, 0.2)'
                        }}
                    >
                        <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-cyan-900/40 flex items-center justify-center text-cyan-400 font-black border border-cyan-800/50">
                                    S
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white uppercase italic">Stoic</span>
                            </div>
                            <button
                                onClick={closeMenu}
                                className="p-2 text-slate-500 hover:text-cyan-400 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-6 relative z-10">
                            <section>
                                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                                    Navigation
                                </p>
                                <Link
                                    href="/"
                                    onClick={closeMenu}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-100 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all"
                                >
                                    <span>Introduction</span>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </Link>
                            </section>

                            <section>
                                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                                    Dunam AI Engine
                                </p>
                                <div className="space-y-1">
                                    <Link
                                        href="/user-guide"
                                        onClick={closeMenu}
                                        className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-cyan-400 transition-colors"
                                    >
                                        Dunam AI Guide
                                    </Link>
                                    {docs.filter(d => d.slug !== 'user-guide').map((doc) => (
                                        <Link
                                            key={doc.slug}
                                            href={`/${doc.slug}`}
                                            onClick={closeMenu}
                                            className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-cyan-400 transition-colors capitalize"
                                        >
                                            {doc.meta.title}
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            <div className="pt-6 border-t border-white/5 mt-auto">
                                <div className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 shadow-inner">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Version</p>
                                    <p className="text-xs font-mono font-bold text-cyan-500">v1.0.0-beta</p>
                                </div>
                            </div>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
