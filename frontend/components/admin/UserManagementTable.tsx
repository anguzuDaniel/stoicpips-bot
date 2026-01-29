"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Search, ChevronDown } from "lucide-react";
import { Skeleton } from "../Skeleton";

interface User {
    id: string;
    email: string;
    subscription_tier: "free" | "pro" | "elite";
    last_active: string;
    total_trades: number;
    is_admin: boolean;
}

export function UserManagementTable() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 50;

    const { data, mutate, isValidating } = useSWR(
        `/admin/users?page=${page}&limit=${limit}&search=${search}`,
        fetcher,
        { refreshInterval: 30000 }
    );

    const users: User[] = data?.users || [];
    const pagination = data?.pagination || { page: 1, total: 0, pages: 1 };

    const handleTierChange = async (userId: string, newTier: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}/tier`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tier: newTier })
            });

            if (response.ok) {
                mutate(); // Refresh data
            } else {
                alert('Failed to update tier');
            }
        } catch (error) {
            console.error('Tier update error:', error);
            alert('Failed to update tier');
        }
    };

    return (
        <div className="border border-[#00F2FF]/30 rounded-lg bg-[#252525]/50 backdrop-blur">
            {/* Header */}
            <div className="p-6 border-b border-[#00F2FF]/20">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#00F2FF]">User Management</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[#1B1B1B] border border-[#00F2FF]/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00F2FF]"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-[#1B1B1B]/80 text-[#00F2FF] border-b border-[#00F2FF]/20">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium">Email</th>
                            <th className="px-6 py-3 text-left font-medium">Subscription Tier</th>
                            <th className="px-6 py-3 text-left font-medium">Total Trades</th>
                            <th className="px-6 py-3 text-left font-medium">Last Active</th>
                            <th className="px-6 py-3 text-left font-medium">Admin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00F2FF]/10">
                        {isValidating && users.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-[#00F2FF]/5 transition-colors">
                                    <td className="px-6 py-4 text-white">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.subscription_tier}
                                            onChange={(e) => handleTierChange(user.id, e.target.value)}
                                            className="px-3 py-1 bg-[#1B1B1B] border border-[#00F2FF]/30 rounded text-white text-xs font-medium focus:outline-none focus:border-[#00F2FF] cursor-pointer"
                                        >
                                            <option value="free">Free</option>
                                            <option value="pro">Pro</option>
                                            <option value="elite">Elite</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{user.total_trades}</td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_admin && (
                                            <span className="px-2 py-1 bg-[#00F2FF]/20 text-[#00F2FF] rounded text-xs font-bold">
                                                ADMIN
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#00F2FF]/20 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    Showing {users.length} of {pagination.total} users
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-[#1B1B1B] border border-[#00F2FF]/30 rounded text-xs text-white disabled:opacity-30 hover:bg-[#00F2FF]/10 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-400">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="px-3 py-1 bg-[#1B1B1B] border border-[#00F2FF]/30 rounded text-xs text-white disabled:opacity-30 hover:bg-[#00F2FF]/10 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
