"use client";

import { useState } from "react";
import { Zap, Rocket } from "lucide-react";
import { userApi } from "@/lib/api";

interface StartTrialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (updatedProfile: any) => void;
}

export function StartTrialModal({ isOpen, onClose, onStart }: StartTrialModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleStartTrial = async () => {
        setIsSubmitting(true);
        try {
            const response = await userApi.startTrial();
            onStart(response.data.profile);
            onClose();
        } catch (error: any) {
            console.error("Failed to start trial:", error);
            const errorMsg = error.response?.data?.error || "An unexpected error occurred. Please try again.";
            alert(`Trial Activation Failed: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-card border-2 border-primary/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] animate-in zoom-in-95 duration-300">

                {/* Header Decoration */}
                <div className="h-32 bg-primary/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                    <div className="h-16 w-16 rounded-2xl bg-primary shadow-lg shadow-primary/40 flex items-center justify-center relative z-10">
                        <Zap className="h-8 w-8 text-primary-foreground fill-current" />
                    </div>
                </div>

                <div className="p-8 pb-10 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-6">

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
                                7-Day Free Trial
                            </h2>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                Unlock full access to the AI Trading Engine. Experience the power of Zero Emotion trading.
                            </p>
                        </div>

                        <button
                            onClick={handleStartTrial}
                            disabled={isSubmitting}
                            className="w-full h-14 bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    Initiating...
                                </span>
                            ) : (
                                "Start My Journey"
                            )}
                        </button>

                        <p className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">
                            No credit card required
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
