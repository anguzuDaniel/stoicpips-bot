"use client";

import { Suspense } from "react";
import { Check, Loader2, CreditCard, Smartphone, Shield, Zap, BarChart3, Globe, Clock, Target, Cpu, Crown } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

// Tier Data
const TIERS = [
    {
        title: "Pro",
        price: "10",
        description: "Perfect for beginners and manual traders.",
        features: [
            "Manual trading signals",
            "Market analysis and insights",
            "Entry/exit recommendations",
            "Basic support"
        ],
        badge: "Essential"
    },
    {
        title: "AI Automated",
        price: "30",
        description: "Designed for intermediate traders wanting automation.",
        features: [
            "Everything in Pro, plus:",
            "Automated signal execution",
            "AI-powered trade management",
            "Advanced analytics dashboard",
            "Priority support"
        ],
        popular: true,
        badge: "Most Popular"
    },
    {
        title: "AI Scalping",
        price: "100",
        description: "For professional traders and serious investors.",
        features: [
            "Everything in AI Automated, plus:",
            "High-frequency scalping bot",
            "Advanced risk management",
            "Custom strategy optimization",
            "24/7 monitoring",
            "Dedicated support"
        ],
        badge: "Enterprise"
    }
];

// Helper Component for Tier Card
const PricingTierCard = ({ title, price, description, features, popular, badge }: any) => (
    <div className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-500 overflow-hidden group ${popular
        ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-transparent shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]'
        : 'border-border bg-card/40 hover:border-primary/30'
        }`}>
        {/* Coming Soon Overlay/Badge */}
        <div className="absolute top-4 right-4 z-20">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                Coming Soon
            </span>
        </div>

        {popular && (
            <div className="absolute -left-12 top-6 -rotate-45 bg-primary px-12 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg">
                Popular
            </div>
        )}

        <div className="mb-8 relative z-10">
            <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
        </div>

        <div className="flex items-baseline gap-1 mb-8 relative z-10">
            <span className="text-5xl font-black tracking-tighter">${price}</span>
            <span className="text-sm font-bold text-muted-foreground">/month</span>
        </div>

        <ul className="space-y-4 mb-10 flex-1 relative z-10">
            {features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3 group/item">
                    <div className={`mt-1 p-0.5 rounded-full ${popular ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground/90 group-hover/item:text-foreground transition-colors">{feature}</span>
                </li>
            ))}
        </ul>

        <button
            disabled
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${popular
                ? 'bg-primary text-primary-foreground shadow-primary/20 cursor-not-allowed opacity-50'
                : 'bg-secondary text-foreground shadow-black/5 cursor-not-allowed opacity-50'
                }`}
        >
            Waitlist Only
        </button>
    </div>
);

// Platform Benefit Component
const BenefitItem = ({ icon: Icon, title, description }: any) => (
    <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-card/30 border border-border/50 hover:border-primary/20 transition-all duration-300">
        <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-5 shadow-inner">
            <Icon className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold uppercase tracking-wider mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

function PricingContent() {
    return (
        <div className="flex-1 p-4 md:p-10 flex flex-col items-center">
            <div className="max-w-[1600px] w-full space-y-20 mt-8">

                {/* Header Section */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                        <Zap className="h-3 w-3 animate-pulse" /> Future Ready
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                        Choose Your <span className="text-primary italic">Trading Rank</span>
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium max-w-2xl mx-auto">
                        We are engineering the future of synthetic automation. Reserve your spot in the next generation of AI trading.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10 opacity-30 pointer-events-none" />
                    {TIERS.map((tier, idx) => (
                        <PricingTierCard key={idx} {...tier} />
                    ))}
                </div>

                {/* Features Section */}
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">Our Capabilities</h2>
                        <h3 className="text-3xl font-black tracking-tight">Platform Benefits</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <BenefitItem
                            icon={Cpu}
                            title="AI Signal Generation"
                            description="Real-time analysis using custom LLM models optimized for synthetic markets."
                        />
                        <BenefitItem
                            icon={Zap}
                            title="Automated Execution"
                            description="Lightning-fast order placement directly on the Deriv platform with zero latency."
                        />
                        <BenefitItem
                            icon={Shield}
                            title="Risk Management"
                            description="Advanced stop-loss, take-profit, and volatility protection at every layer."
                        />
                        <BenefitItem
                            icon={Globe}
                            title="Multi-Exchange"
                            description="Deep integration across synthetic indices to maximize your trading opportunities."
                        />
                        <BenefitItem
                            icon={BarChart3}
                            title="Performance Analytics"
                            description="Granular tracking of win rates, PnL, and AI confidence scores in real-time."
                        />
                        <BenefitItem
                            icon={Clock}
                            title="24/7 Monitoring"
                            description="Always-on infrastructure that never sleeps, ensuring you never miss a trade."
                        />
                    </div>
                </div>

                {/* Footer Section */}
                <div className="pt-20 border-t border-border/50 text-center">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Secured & Integrated with</h4>
                    <div className="flex flex-wrap justify-center gap-10 opacity-40 grayscale">
                        <div className="flex items-center gap-2 text-sm font-black tracking-tighter"><CreditCard className="h-5 w-5" /> FLUTTERWAVE</div>
                        <div className="flex items-center gap-2 text-sm font-black tracking-tighter"><Smartphone className="h-5 w-5" /> MOBILE MONEY</div>
                        <div className="flex items-center gap-2 text-sm font-black tracking-tighter"><Shield className="h-5 w-5" /> 256-BIT SSL</div>
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
