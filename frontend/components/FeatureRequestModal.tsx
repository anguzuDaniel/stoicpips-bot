"use client";

import { useState } from "react";
import { X, Send, Lightbulb, Loader2, Sparkles } from "lucide-react";
import { userApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface FeatureRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FeatureRequestModal({ isOpen, onClose }: FeatureRequestModalProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        impact: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await userApi.requestFeature(formData);
            addToast("Feature request submitted! We value your feedback.", "success");
            onClose();
            setFormData({ title: "", description: "", impact: "" });
        } catch (error: any) {
            const msg = error.response?.data?.error || "Failed to submit request.";
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
                            <Lightbulb className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">Request a Feature</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Share your ideas with us</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">What's your idea?</label>
                        <input
                            type="text"
                            placeholder="Brief title of the feature"
                            className="flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Describe the feature</label>
                        <textarea
                            placeholder="Explain how it would work and why it would be useful..."
                            className="flex min-h-[120px] w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Anticipated Impact (Optional)</label>
                        <textarea
                            placeholder="How will this help you or other traders?"
                            className="flex min-h-[80px] w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            value={formData.impact}
                            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <Sparkles className="h-5 w-5 text-primary shrink-0" />
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase tracking-widest">
                            We review every suggestion. Top-voted features are prioritized for development.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Submit Idea
                    </button>
                </form>
            </div>
        </div>
    );
}
