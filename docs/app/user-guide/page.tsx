import { CheckCircle2, Key, Zap, Search, ShieldAlert, History } from 'lucide-react';

export default function UserGuide() {
    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <section className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/50 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    <span>Version v1.0.0-beta</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-white">Dunam AI</h1>
                <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                    The flagship execution engine of Stoicpips Inc. Achieving <span className="text-cyan-400 font-bold italic">Total Execution</span> through emotionless, high-precision automated trading.
                </p>
            </section>

            {/* Onboarding Overview */}
            <section className="space-y-8">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-sm">01</span>
                    <span>Onboarding Flow</span>
                </h2>

                <div className="grid grid-cols-1 gap-6">
                    {/* Phase 1 */}
                    <PhaseCard
                        phase="Phase 1"
                        title="Authentication"
                        badge="[Setup]"
                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        description="Sign up using Google OAuth or Supabase Auth. Our zero-knowledge identity layer ensures your credentials remain private."
                    />

                    {/* Phase 2 */}
                    <PhaseCard
                        phase="Phase 2"
                        title="API Integration"
                        badge="[Execute]"
                        icon={<Key className="w-5 h-5 text-cyan-400" />}
                        description="Connect your exchange API keys. Dunam AI requires 'Trade' permissions but prohibits 'Withdrawal' access for maximum security."
                    />

                    {/* Phase 3 */}
                    <PhaseCard
                        phase="Phase 3"
                        title="Strategy Selection"
                        badge="[Execute]"
                        icon={<Zap className="w-5 h-5 text-purple-400" />}
                        description="Choose your AI profile. Select between Scalping (High Frequency) or Trend Following (Institutional) logic."
                    />

                    {/* Phase 4 */}
                    <PhaseCard
                        phase="Phase 4"
                        title="Monitoring"
                        badge="[Monitor]"
                        icon={<Search className="w-5 h-5 text-pink-400" />}
                        description="Access the 'Total Execution' dashboard. Track live P&L, signal confidence levels, and zone re-tests in real-time."
                    />
                </div>
            </section>

            {/* Changelog */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <History className="w-6 h-6 text-slate-500" />
                    <span>Changelog</span>
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm">
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="text-sm font-bold text-cyan-400">v1.0.0-beta</span>
                        <span className="text-xs text-slate-500 italic">Initial Release — 2024</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-400 list-disc pl-5">
                        <li>Launch of the Dunam AI Engine on Google Cloud Run.</li>
                        <li>Real-time Supply/Demand zone detection algorithms.</li>
                        <li>Next.js 'Stoic Dark' dashboard integration.</li>
                        <li>Multi-symbol support for Synthetic Indices (R_100, R_50).</li>
                    </ul>
                </div>
            </section>

            {/* Risk Disclaimer */}
            <section className="space-y-6">
                <div className="p-8 rounded-2xl border border-red-900/30 bg-red-950/10 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 text-red-400 mb-4">
                        <ShieldAlert className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Risk Disclaimer</h2>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Automated trading involves significant risk of capital loss. Dunam AI is an execution tool and does not guarantee profits. Past performance of AI models on Cloud Run is not indicative of future results. Only trade with capital you can afford to lose. Stoicpips Inc. is not liable for financial losses incurred through the use of this software.
                    </p>
                </div>
            </section>
        </div>
    );
}

function PhaseCard({ phase, title, badge, icon, description }: any) {
    return (
        <div className="group flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md hover:bg-slate-900/60 hover:border-slate-700 transition-all">
            <div className="flex-shrink-0 flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{phase}</div>
                    <div className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</div>
                </div>
            </div>
            <div className="flex-1 text-sm text-slate-400 leading-relaxed">
                {description}
            </div>
            <div className="flex-shrink-0 text-[10px] font-black uppercase px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
            </div>
        </div>
    );
}
