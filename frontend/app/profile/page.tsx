"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { botApi } from "@/lib/api";
import { Loader2, Save, AlertCircle, User, Landmark, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [profile, setProfile] = useState<any>(null);
    const [bankInfo, setBankInfo] = useState({
        bankName: "",
        accountNumber: "",
        accountName: ""
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
                setBankInfo({
                    bankName: userProfile.bank_name || "",
                    accountNumber: userProfile.account_number || "",
                    accountName: userProfile.account_name || ""
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setError("Could not load profile information.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBank = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await botApi.updateBankInfo(bankInfo);
            setSuccess("Bank information updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save bank information");
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
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Account Profile</h1>
                        <p className="text-sm text-muted-foreground">Manage your personal and settlement information</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Basic Info (Read Only for now) */}
                    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold border-b border-border pb-2 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            Account Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Email Address</label>
                                <p className="text-sm font-semibold">{profile?.email || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground uppercase">Subscription Tier</label>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${profile?.subscription_tier === 'elite' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                            profile?.subscription_tier === 'pro' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                                                'bg-secondary text-muted-foreground'
                                        }`}>
                                        {profile?.subscription_tier || 'Free'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info Section */}
                    <form onSubmit={handleSaveBank} className="rounded-xl border border-border bg-card p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-blue-500" />
                                Bank Account Information
                            </h2>
                        </div>

                        <p className="text-xs text-muted-foreground italic mb-4">
                            Note: This information is required to verify your account and enable premium features.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                                <input
                                    type="text"
                                    required
                                    value={bankInfo.bankName}
                                    onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                                    placeholder="e.g. Stanbic Bank"
                                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                                <input
                                    type="text"
                                    required
                                    value={bankInfo.accountNumber}
                                    onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                                    placeholder="00XXX..."
                                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                                <input
                                    type="text"
                                    required
                                    value={bankInfo.accountName}
                                    onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                                    placeholder="Your Full Name (As it appears on your bank statement)"
                                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                            <div className="flex-1 w-full sm:w-auto">
                                {error && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs animate-in fade-in">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-green-500 text-xs animate-in fade-in">
                                        <Save className="h-4 w-4" />
                                        {success}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-5 w-5" />}
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
