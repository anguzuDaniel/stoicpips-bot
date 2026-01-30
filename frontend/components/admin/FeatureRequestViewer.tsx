"use client";

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Loader2, Lightbulb, CheckCircle, Clock, Sparkles, XCircle, Search, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function FeatureRequestViewer() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchRequests = async () => {
        try {
            const { data } = await adminApi.getFeatureRequests();
            setRequests(data.requests);
        } catch (error) {
            console.error("Failed to fetch feature requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await adminApi.updateFeatureRequestStatus(id, status);
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'implemented': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'planned': return <Sparkles className="h-4 w-4 text-blue-500" />;
            case 'under_review': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'discarded': return <XCircle className="h-4 w-4 text-gray-500" />;
            default: return <Info className="h-4 w-4 text-amber-500" />;
        }
    };

    const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Feature Requests</h2>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'under_review', 'planned', 'implemented'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredRequests.map((request) => (
                    <div key={request.id} className="bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/20">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{request.title}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Suggested by <span className="text-foreground font-medium">User ID: {request.user_id.substring(0, 8)}...</span> • {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={request.status}
                                    onChange={(e) => updateStatus(request.id, e.target.value)}
                                    className="bg-muted px-2 py-1 rounded text-xs font-medium border-none focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="planned">Planned</option>
                                    <option value="implemented">Implemented</option>
                                    <option value="discarded">Discarded</option>
                                </select>
                                {getStatusIcon(request.status)}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                        {request.impact && (
                            <div className="bg-primary/5 p-3 rounded-lg text-xs text-muted-foreground border border-primary/10">
                                <strong className="select-none text-primary/70 block mb-1">ANTICIPATED IMPACT:</strong>
                                {request.impact}
                            </div>
                        )}
                    </div>
                ))}

                {filteredRequests.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No feature requests found matching this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
