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
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Account Profile</h1>
                        <p className="text-sm text-muted-foreground font-medium">Manage your card details and account settlements</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column: Security Overview */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-sm">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                Security Status
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-secondary/20 border border-border/30">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Primary Email</label>
                                    <p className="text-sm font-semibold truncate text-foreground">{profile?.email || 'N/A'}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/20 border border-border/30">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Membership Level</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${profile?.subscription_tier === 'elite' ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white' :
                                                profile?.subscription_tier === 'pro' ? 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {profile?.subscription_tier || 'Free'} Tier
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-gradient-to-br from-blue-600/5 to-indigo-600/5 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-indigo-400 mb-1">Pro Tip</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Elite members get 24/7 priority support and access to our advanced LLM signal engines.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Card Form */}
                    <div className="xl:col-span-2">
                        <form onSubmit={handleSaveCard} className="rounded-2xl border border-border bg-card p-6 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-blue-500" />
                                    Settlement Card Information
                                </h2>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex gap-3 items-start">
                                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    SyntoicAi requires valid card information to authorize live trading sessions.
                                    Your data is encrypted and handled according to our security protocols.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cardholder Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={cardInfo.cardholderName}
                                        onChange={(e) => setCardInfo({ ...cardInfo, cardholderName: e.target.value })}
                                        placeholder="Full Name"
                                        className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Card Number Reference</label>
                                    <input
                                        type="text"
                                        required
                                        value={cardInfo.cardLastFour}
                                        onChange={(e) => setCardInfo({ ...cardInfo, cardLastFour: e.target.value })}
                                        placeholder="Last 4 Digits or Reference"
                                        className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiry & Safety Metadata</label>
                                    <input
                                        type="text"
                                        required
                                        value={cardInfo.expiryDate}
                                        onChange={(e) => setCardInfo({ ...cardInfo, expiryDate: e.target.value })}
                                        placeholder="MM / YY"
                                        className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
                                <div className="flex-1 w-full sm:w-auto">
                                    {error && (
                                        <div className="flex items-center gap-2 text-destructive text-xs font-bold animate-in zoom-in">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="flex items-center gap-2 text-green-500 text-xs font-bold animate-in zoom-in">
                                            <Save className="h-4 w-4" />
                                            {success}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-2.5 font-bold text-sm text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
