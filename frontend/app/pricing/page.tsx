"use client";

import { useState, useEffect, Suspense } from "react";
import { botApi } from "@/lib/api";
import { Check, Loader2, CreditCard, Smartphone } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

// Helper Component for Tier Card
const TierCard = ({ title, price, features, tier, popular, onSubscribe, loadingTier }: any) => (
    <div className={`relative p-8 rounded-2xl border ${popular ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.2)]' : 'border-border bg-card'} flex flex-col`}>
        {popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-bold text-xs py-1 px-3 rounded-full uppercase tracking-wider">
                Most Popular
            </div>
        )}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold">${price}</span>
            <span className="text-muted-foreground">/month</span>
        </div>

        <ul className="space-y-4 mb-8 flex-1">
            {features.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className={`h-5 w-5 shrink-0 ${popular ? 'text-amber-500' : 'text-primary'}`} />
                    <span>{f}</span>
                </li>
            ))}
        </ul>

        <button
            onClick={() => onSubscribe(tier)}
            disabled={!!loadingTier}
            className={`w-full py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${popular
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-secondary hover:bg-secondary/80'
                }`}
        >
            {loadingTier === tier ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
                `Subscribe to ${title}`
            )}
        </button>
    </div>
);

function PricingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            setSuccess(true);
        }
    }, [searchParams]);

    const handleSubscribe = async (tier: 'pro' | 'elite') => {
        try {
            setLoadingTier(tier);
            setError("");
            const res = await botApi.initializePayment(tier);
            if (res.data && res.data.link) {
                window.location.href = res.data.link; // Redirect to Flutterwave
            } else {
                setError("Failed to generate payment link.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.error || "Payment initialization failed.");
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <div className="flex-1 p-4 md:p-10 flex flex-col items-center">
            <div className="max-w-[1600px] w-full space-y-12 mt-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight">Upgrade Your Trading</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Unlock AI-powered signals, automation, and prioritized execution with our premium tiers.
                    </p>
                </div>

                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-xl text-center animate-in zoom-in-95 duration-300">
                        <h3 className="text-xl font-bold text-green-500 mb-2">Payment Successful!</h3>
                        <p className="text-muted-foreground">Your account is being upgraded. It may take a few moments for changes to reflect.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-4 text-sm font-medium underline hover:text-green-400"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-center text-red-500">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 pt-8">
                    <TierCard
                        title="Pro"
                        price="49"
                        tier="pro"
                        onSubscribe={handleSubscribe}
                        loadingTier={loadingTier}
                        features={[
                            "Advanced AI Signals",
                            "Smart Risk Management",
                            "Email Notifications",
                            "Standard Support",
                            "Manual Execution Only (Signal Mode)"
                        ]}
                    />
                    <TierCard
                        title="Elite"
                        price="99"
                        tier="elite"
                        popular
                        onSubscribe={handleSubscribe}
                        loadingTier={loadingTier}
                        features={[
                            "Everything in Pro",
                            "Full Auto-Trading",
                            "Prioritized Execution Speed",
                            "AI Market Analysis",
                            "24/7 Priority Support",
                            "No Commission on Profits"
                        ]}
                    />
                </div>

                <div className="mt-12 text-center">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Secured by Flutterwave</h4>
                    <div className="flex justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                        <div className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Cards (Visa/Mastercard)</div>
                        <div className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> Mobile Money (MTN/Airtel)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex justify-center items-center h-full min-h-[500px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                <PricingContent />
            </Suspense>
        </DashboardLayout>
    );
}
