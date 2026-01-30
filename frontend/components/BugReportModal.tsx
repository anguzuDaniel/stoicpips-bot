"use client";

import { useState } from "react";
import { X, Send, AlertTriangle, Bug, Loader2 } from "lucide-react";
import { botApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface BugReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        steps: "",
        severity: "low"
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await botApi.reportBug(formData);
            addToast("Bug reported successfully. Thank you for your feedback!", "success");
            onClose();
            setFormData({ title: "", description: "", steps: "", severity: "low" });
        } catch (error: any) {
            const msg = error.response?.data?.error || "Failed to submit report.";
            addToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300 px-4">
            <div className="w-full max-w-lg overflow-hidden bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Bug className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">Report a Bug</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Help us improve Dunam Ai</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Short Summary</label>
                        <input
                            type="text"
                            placeholder="e.g. Bot stop loss not triggering on Real account"
                            className="flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Severity</label>
                            <select
                                className="flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                            >
                                <option value="low">Low (Minor visual issue)</option>
                                <option value="medium">Medium (Annoying but works)</option>
                                <option value="high">High (Trade execution issue)</option>
                                <option value="critical">Critical (Funds/Security)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detailed Description</label>
                        <textarea
                            placeholder="Explain what's happening..."
                            className="flex min-h-[100px] w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Steps to Reproduce (Optional)</label>
                        <textarea
                            placeholder="1. Go to Settings&#10;2. Set SL to 2%&#10;3. Save fails"
                            className="flex min-h-[80px] w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            value={formData.steps}
                            onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                        <p className="text-[10px] font-medium text-amber-500/80 leading-relaxed uppercase tracking-widest">
                            Official support will review this within 24-48 hours. Please do not submit fund recovery requests here.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
}
