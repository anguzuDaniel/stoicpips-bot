"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { botApi, userApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, AlertCircle, User, CreditCard, ShieldCheck, Crown, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [profile, setProfile] = useState<any>(null);
    const [userAuth, setUserAuth] = useState<any>(null);

    const [profileData, setProfileData] = useState({
        fullName: "",
        username: "",
        tradingExperience: "beginner",
        cardholderName: "",
        cardLastFour: "",
        expiryDate: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // 1. Get Auth User for Email (Source of Truth)
            const { data: { user } } = await supabase.auth.getUser();
            setUserAuth(user);

            // 2. Get Profile from DB
            const response = await userApi.getProfile();
            if (response.data && response.data.user) {
                const dbProfile = response.data.user;
                setProfile(dbProfile);
                setProfileData({
                    fullName: dbProfile.full_name || "",
                    username: dbProfile.username || "",
                    tradingExperience: dbProfile.trading_experience || "beginner",
                    cardholderName: dbProfile.bank_name || "",
                    cardLastFour: dbProfile.account_number || "",
                    expiryDate: dbProfile.account_name || ""
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
            setError("Could not load profile information.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await userApi.updateProfile({
                fullName: profileData.fullName,
                username: profileData.username,
                tradingExperience: profileData.tradingExperience,
                bankName: profileData.cardholderName,
                accountNumber: profileData.cardLastFour,
                accountName: profileData.expiryDate
            });
            setSuccess("Profile updated successfully!");

            // Re-fetch to update state
            const response = await userApi.getProfile();
            if (response.data && response.data.user) setProfile(response.data.user);

            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save profile information");
        } finally {
            setSaving(false);
        }
    };

    const isProfileIncomplete = !profileData.fullName || !profileData.username || !profileData.tradingExperience;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const greetingName = profileData.fullName || userAuth?.email?.split('@')[0] || "Trader";

    return (
        <DashboardLayout>
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
                {/* Hero Greeting Section */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-800 p-6 md:p-8 mb-8 shadow-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Crown className="h-8 w-8 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]" />
                        </div>
                        <div className="text-center md:text-left text-white">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                                Welcome, <span className="text-amber-300">Emperor</span> {greetingName}
                            </h1>
                            <p className="text-sm text-white/80 font-medium">Command your synthetic empire and master the markets.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column: Security & Status */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-md p-8 space-y-8 shadow-sm">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-green-500" />
                                Empire Status
                            </h2>
                            <div className="space-y-5">
                                <div className="p-5 rounded-2xl bg-secondary/10 border border-border/50">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Command Email</label>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-bold truncate text-foreground">{userAuth?.email || 'N/A'}</p>
                                        <div className="flex">
                                            {profile?.is_email_verified ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                                                    <CheckCircle className="h-3 w-3" /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                                                    <AlertTriangle className="h-3 w-3" /> Unverified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-secondary/10 border border-border/50">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Authorization Level</label>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${profile?.subscription_tier === 'elite' ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white' :
                                            profile?.subscription_tier === 'pro' ? 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white' :
                                                'bg-muted text-muted-foreground'
                                            }`}>
                                            {profile?.subscription_tier || 'Free'} Rank
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-8 shadow-inner">
                            <div className="flex items-center gap-3 mb-3">
                                <Crown className="h-5 w-5 text-amber-500" />
                                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider">Strategic Note</h3>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                "The impediment to action advances action. What stands in the way becomes the way." – Ensure your trading experience is correctly set to optimize AI signals.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Information Form */}
                    <div className="xl:col-span-2">
                        <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border bg-card/40 backdrop-blur-md p-8 space-y-10 shadow-xl">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-border pb-4">
                                    <User className="h-6 w-6 text-indigo-500" />
                                    <h2 className="text-xl font-bold">General Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            placeholder="Your Real Name"
                                            className="w-full bg-input/50 border border-border/80 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Universal Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                            placeholder="@emperor_trader"
                                            className="w-full bg-input/50 border border-border/80 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Trading Experience</label>
                                        <select
                                            value={profileData.tradingExperience}
                                            onChange={(e) => setProfileData({ ...profileData, tradingExperience: e.target.value })}
                                            className="w-full bg-input/50 border border-border/80 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="beginner">Beginner (Learning the Basics)</option>
                                            <option value="intermediate">Intermediate (Familiar with Strategies)</option>
                                            <option value="pro">Pro Master (Advanced Synthetic Trading)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Card Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-border pb-4">
                                    <CreditCard className="h-6 w-6 text-blue-500" />
                                    <h2 className="text-xl font-bold">Settlement Card Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Cardholder Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.cardholderName}
                                            onChange={(e) => setProfileData({ ...profileData, cardholderName: e.target.value })}
                                            placeholder="Name on Card"
                                            className="w-full bg-input/50 border border-border/80 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Card Number Reference</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.cardLastFour}
                                            onChange={(e) => setProfileData({ ...profileData, cardLastFour: e.target.value })}
                                            placeholder="Last 4 Digits"
                                            className="w-full bg-input/50 border border-border/80 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase tracking-wider ml-1">Expiry / Security Meta</label>
                                        <input
                                            type="text"
                                            required
                                            value={profileData.expiryDate}
                                            onChange={(e) => setProfileData({ ...profileData, expiryDate: e.target.value })}
                                            placeholder="MM / YY"
                                            className="w-full bg-input/50 border border-border/80 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-border">
                                <div className="flex-1 w-full sm:w-auto">
                                    {error && (
                                        <div className="flex items-center gap-3 text-destructive text-xs font-bold animate-in zoom-in p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="flex items-center gap-3 text-green-500 text-xs font-bold animate-in zoom-in p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                            <Save className="h-4 w-4" />
                                            {success}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-10 py-4 font-black text-sm text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                        Update Empire Records
                                    </button>

                                    {!isProfileIncomplete && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (profile?.subscription_tier === 'free' || !profile?.subscription_tier) {
                                                    router.push("/pricing");
                                                } else {
                                                    router.push("/");
                                                }
                                            }}
                                            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white border border-border px-10 py-4 font-black text-sm text-slate-900 shadow-sm transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {profile?.subscription_tier === 'free' || !profile?.subscription_tier ? "Select a Plan" : "Continue to Dashboard"}
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
