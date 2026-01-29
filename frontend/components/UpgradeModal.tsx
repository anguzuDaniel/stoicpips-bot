"use client";

import { X, Crown } from "lucide-react";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export function UpgradeModal({ isOpen, onClose, message }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-card border border-amber-500/50 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] p-8 animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
                        <Crown className="h-8 w-8 text-amber-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                            The Emperor Has Spoken
                        </h2>
                        <p className="text-muted-foreground">
                            {message || "You have seen the power of SyntoicAi. Upgrade to Elite for full automation."}
                        </p>
                    </div>

                    <div className="grid gap-3 w-full">
                        <button
                            onClick={() => window.location.href = '/settings'}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20"
                        >
                            Upgrade to Elite
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
