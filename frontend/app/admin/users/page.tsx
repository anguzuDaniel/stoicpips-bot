"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { adminApi } from "@/lib/api";
import { Loader2, Search, User, Shield, AlertTriangle, CheckCircle, XCircle, MoreVertical, Crown, Ban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stats, setStats] = useState({ total: 0, active: 0, pro: 0 });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await adminApi.listUsers();

            // Client-side filtering for now if API doesn't fully support search
            // The API does support search, but we can also process data here
            if (data.users) {
                setUsers(data.users);

                // Calculate stats
                const total = data.users.length;
                const active = data.users.filter((u: any) => u.is_active !== false).length;
                const pro = data.users.filter((u: any) => u.subscription_tier !== 'free').length;
                setStats({ total, active, pro });
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));

            await adminApi.toggleUserStatus(userId, !currentStatus);
        } catch (error) {
            console.error("Failed to toggle status:", error);
            // Revert
            fetchUsers();
        }
    };

    const handleUpdateTier = async (userId: string, tier: string) => {
        try {
            await adminApi.updateUserTier(userId, tier);
            fetchUsers(); // Refresh to get updated data
        } catch (error) {
            console.error("Failed to update tier:", error);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.includes(search)
    );

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">User Management</h1>
                        <p className="text-muted-foreground mt-1">Manage user access, tiers, and account status.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Total Users</p>
                                <p className="text-3xl font-black">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Active Users</p>
                                <p className="text-3xl font-black">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                <Crown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Premium Members</p>
                                <p className="text-3xl font-black">{stats.pro}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Table */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search users by email or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-96 pl-10 pr-4 py-2 rounded-xl bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-muted-foreground">User</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-muted-foreground">Status</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-muted-foreground">Tier</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-muted-foreground">Joined</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" /> Loading users...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                                                            {user.email.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{user.email}</p>
                                                            <p className="text-[10px] text-muted-foreground font-mono">{user.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.is_active !== false ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                                                            <CheckCircle className="h-3 w-3" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider">
                                                            <Ban className="h-3 w-3" /> Banned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.subscription_tier === 'elite' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        user.subscription_tier === 'pro' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                            'bg-secondary/50 text-muted-foreground border-border'
                                                        }`}>
                                                        {user.subscription_tier || 'Free'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                                                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <select
                                                            value={user.subscription_tier}
                                                            onChange={(e) => handleUpdateTier(user.id, e.target.value)}
                                                            className="bg-transparent text-[10px] font-bold border border-border rounded px-1 py-0.5 focus:outline-none focus:border-primary"
                                                        >
                                                            <option value="free">Free</option>
                                                            <option value="pro">Pro</option>
                                                            <option value="elite">Elite</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id, user.is_active ?? true)}
                                                            className={`p-1 rounded hover:bg-muted transition-colors ${user.is_active !== false ? 'text-red-500' : 'text-green-500'}`}
                                                            title={user.is_active !== false ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {user.is_active !== false ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
