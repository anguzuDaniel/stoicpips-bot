"use client";

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Loader2, Bug, CheckCircle, Clock, AlertTriangle, XCircle, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BugReportViewer() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchReports = async () => {
        try {
            const { data } = await adminApi.getBugReports();
            setReports(data.reports);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await adminApi.updateBugReportStatus(id, status);
            fetchReports(); // Refresh list
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        }
    };

    const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                        <Bug className="h-5 w-5 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold">Bug Reports</h2>
                </div>
                <div className="flex gap-2">
                    {['all', 'open', 'in_progress', 'resolved'].map(f => (
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
                {filteredReports.map((report) => (
                    <div key={report.id} className="bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/20">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(report.severity)}`}>
                                        {report.severity}
                                    </span>
                                    <h3 className="font-bold text-lg">{report.title}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Reported by <span className="text-foreground font-medium">{report.users?.full_name || report.users?.email}</span> • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={report.status}
                                    onChange={(e) => updateStatus(report.id, e.target.value)}
                                    className="bg-muted px-2 py-1 rounded text-xs font-medium border-none focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                {getStatusIcon(report.status)}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                        {report.steps && (
                            <div className="bg-muted/30 p-3 rounded-lg text-xs font-mono text-muted-foreground">
                                <strong className="select-none text-primary/50 block mb-1">STEPS TO REPRODUCE:</strong>
                                {report.steps}
                            </div>
                        )}
                    </div>
                ))}

                {filteredReports.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No reports found matching this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
