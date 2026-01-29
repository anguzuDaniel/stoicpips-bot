"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { botApi } from "@/lib/api";
import { Loader2, Save, AlertCircle, User, CreditCard, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [profile, setProfile] = useState<any>(null);
    const [cardInfo, setCardInfo] = useState({
        cardholderName: "",
        cardLastFour: "",
        expiryDate: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await botApi.getProfile();
            if (response.data && response.data.user) {
                const userProfile = response.data.user;
                setProfile(userProfile);
                setCardInfo({
                    cardholderName: userProfile.bank_name || "",
                    cardLastFour: userProfile.account_number || "",
                    expiryDate: userProfile.account_name || ""
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setError("Could not load profile information.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCard = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // We reuse the updateBankInfo endpoint but send card fields
            await botApi.updateCardInfo({
                bankName: cardInfo.cardholderName,
                accountNumber: cardInfo.cardLastFour,
                accountName: cardInfo.expiryDate
            });
            setSuccess("Card information updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save card information");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
                <div className="flex items-center gap-6 mb-12">
                    <div className="p-5 rounded-[2rem] bg-indigo-500/10 text-indigo-500 shadow-inner">
                        <User className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1">Account Profile</h1>
                        <p className="text-lg text-muted-foreground font-medium">Manage your secure card details and account settlements</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Left Column: Security Overview */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-md p-8 space-y-8 shadow-xl">
                            <h2 className="text-2xl font-bold flex items-center gap-4">
                                <ShieldCheck className="h-7 w-7 text-green-500" />
                                Security Status
                            </h2>
                            <div className="space-y-6">
                                <div className="p-5 rounded-2xl bg-secondary/20 border border-border/30 hover:bg-secondary/30 transition-colors">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Primary Email</label>
                                    <p className="text-xl font-bold truncate text-foreground">{profile?.email || 'N/A'}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-secondary/20 border border-border/30 hover:bg-secondary/30 transition-colors">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">Membership Level</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg ${profile?.subscription_tier === 'elite' ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white' :
                                            profile?.subscription_tier === 'pro' ? 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                            {profile?.subscription_tier || 'Free'} Tier
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-8 shadow-inner">
                            <h3 className="font-bold text-indigo-400 mb-2">Pro Tip</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Elite members get 24/7 priority support and access to our advanced LLM signal engines.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Card Form (Takes up 2/3) */}
                    <div className="xl:col-span-2">
                        <form onSubmit={handleSaveCard} className="rounded-3xl border border-border bg-card/40 backdrop-blur-md p-8 space-y-10 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-border/50 pb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-4">
                                    <CreditCard className="h-7 w-7 text-blue-500" />
                                    Settlement Card Information
                                </h2>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex gap-4 items-start shadow-inner">
                                <AlertCircle className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                    SyntoicAi requires valid card information to authorize live trading sessions.
                                    Your data is encrypted and handled according to our strict security protocols.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-muted-foreground ml-2 uppercase tracking-tight">Cardholder Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={cardInfo.cardholderName}
                                        onChange={(e) => setCardInfo({ ...cardInfo, cardholderName: e.target.value })}
                                        placeholder="Enter Full Name"
                                        className="w-full bg-input/40 border border-border/60 rounded-2xl px-6 py-4 text-base font-medium focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-sm placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-muted-foreground ml-2 uppercase tracking-tight">Card Number Reference</label>
                                    <input
                                        type="text"
                                        required
                                        value={cardInfo.cardLastFour}
                                        onChange={(e) => setCardInfo({ ...cardInfo, cardLastFour: e.target.value })}
                                        placeholder="Last 4 Digits or Reference"
                                        className="w-full bg-input/40 border border-border/60 rounded-2xl px-6 py-4 text-base font-medium focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-sm placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-sm font-black text-muted-foreground ml-2 uppercase tracking-tight">Expiry & Safety Metadata</label>
                                    <input
                                        type="text"
                                        required
                                        value={cardInfo.expiryDate}
                                        onChange={(e) => setCardInfo({ ...cardInfo, expiryDate: e.target.value })}
                                        placeholder="MM / YY"
                                        className="w-full bg-input/40 border border-border/60 rounded-2xl px-6 py-4 text-base font-medium focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-sm placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-border/50">
                                <div className="flex-1 w-full sm:w-auto">
                                    {error && (
                                        <div className="flex items-center gap-4 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-destructive text-sm font-bold shadow-sm animate-in zoom-in">
                                            <AlertCircle className="h-5 w-5" />
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="flex items-center gap-4 rounded-2xl bg-green-500/10 border border-green-500/20 p-5 text-green-500 text-sm font-bold shadow-sm animate-in zoom-in">
                                            <Save className="h-5 w-5" />
                                            {success}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto flex items-center justify-center gap-4 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-700 px-12 py-5 font-black text-lg text-white shadow-2xl shadow-blue-500/40 transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-blue-500/60 disabled:opacity-50 disabled:grayscale"
                                >
                                    {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-7 w-7" />}
                                    Save Card Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
