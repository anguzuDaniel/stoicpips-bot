"use client";

import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { Bell, Send, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function AnnouncementsManager() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        expiresInDays: '1'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresInDays));

            await adminApi.createAnnouncement({
                title: formData.title,
                message: formData.message,
                type: formData.type,
                expiresAt: expiresAt.toISOString()
            });

            addToast("Announcement broadcasted successfully", "success");
            setFormData({ title: '', message: '', type: 'info', expiresInDays: '1' });
        } catch (error) {
            addToast("Failed to send announcement", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Broadcast Announcement</h2>
                    <p className="text-sm text-muted-foreground">Send global notifications to all active users</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="info">Information (Blue)</option>
                            <option value="warning">Warning (Yellow)</option>
                            <option value="critical">Critical (Red)</option>
                            <option value="success">Success (Green)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</label>
                        <select
                            value={formData.expiresInDays}
                            onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
                            className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="1">24 Hours</option>
                            <option value="3">3 Days</option>
                            <option value="7">1 Week</option>
                            <option value="30">1 Month</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Scheduled Maintenance"
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Detailed message regarding the update..."
                        className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Broadcast Now
                </button>
            </form>
        </div>
    );
}
