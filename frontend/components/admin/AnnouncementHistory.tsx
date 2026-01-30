"use client";

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Trash2, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/context/ToastContext';

export function AnnouncementHistory() {
    const { addToast } = useToast();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const { data } = await adminApi.getAnnouncementHistory();
            setAnnouncements(data.announcements);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await adminApi.deleteAnnouncement(id);
            addToast("Announcement deleted", "success");
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            addToast("Failed to delete announcement", "error");
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    if (loading) return <div className="text-center py-4 text-muted-foreground">Loading history...</div>;

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Announcement History</h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start justify-between group p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex gap-3">
                            <div className="mt-1">{getTypeIcon(announcement.type)}</div>
                            <div>
                                <h4 className="font-semibold text-sm">{announcement.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">{announcement.message}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                                    </span>
                                    {announcement.expires_at && (
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                            Expires {new Date(announcement.expires_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(announcement.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Announcement"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {announcements.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">No announcements broadcasted yet.</p>
                )}
            </div>
        </div>
    );
}
