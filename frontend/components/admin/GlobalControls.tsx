"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Power, Play, AlertTriangle } from "lucide-react";
import { AlertModal } from "../AlertModal";
import { ConfirmModal } from "../ConfirmModal";

export function GlobalControls() {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pauseReason, setPauseReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertState, setAlertState] = useState<{ isOpen: boolean, type: "error" | "success" | "info", title?: string, message: string }>({ isOpen: false, type: "error", message: "" });

    const { data: botStatus, mutate } = useSWR(
        '/admin/bot/status',
        fetcher,
        { refreshInterval: 5000 }
    );

    const isPaused = botStatus?.is_paused || false;

    const handleGreatPause = async () => {
        if (!pauseReason.trim()) {
            setAlertState({ isOpen: true, type: "warning", title: "Reason Required", message: "Please provide a reason for the pause" });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/bot/pause`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason: pauseReason })
            });

            if (response.ok) {
                mutate();
                setShowConfirmModal(false);
                setPauseReason("");
            } else {
                setAlertState({ isOpen: true, type: "error", title: "Error", message: 'Failed to trigger Great Pause' });
            }
        } catch (error) {
            console.error('Great Pause error:', error);
            setAlertState({ isOpen: true, type: "error", title: "Error", message: 'Failed to trigger Great Pause' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResume = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/bot/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                mutate();
            } else {
                setAlertState({ isOpen: true, type: "error", title: "Error", message: 'Failed to resume trading' });
            }
        } catch (error) {
            console.error('Resume error:', error);
            setAlertState({ isOpen: true, type: "error", title: "Error", message: 'Failed to resume trading' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="border border-[#00F2FF]/30 rounded-lg bg-[#252525]/50 backdrop-blur">
                {/* Header */}
                <div className="p-6 border-b border-[#00F2FF]/20">
                    <h2 className="text-xl font-bold text-[#00F2FF]">Global Controls</h2>
                    <p className="text-xs text-gray-400 mt-1">Emergency system-wide controls</p>
                </div>

                {/* Status */}
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[#1B1B1B]/50 border border-[#00F2FF]/20 mb-6">
                        <div>
                            <span className="text-sm text-gray-400">Current Status</span>
                            <p className={`text-lg font-bold ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
                                {isPaused ? 'PAUSED' : 'ACTIVE'}
                            </p>
                            {isPaused && botStatus?.pause_reason && (
                                <p className="text-xs text-gray-400 mt-1">Reason: {botStatus.pause_reason}</p>
                            )}
                            {isPaused && botStatus?.paused_by && (
                                <p className="text-xs text-gray-500 mt-1">By: {botStatus.paused_by}</p>
                            )}
                        </div>
                        <div className={`h-3 w-3 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                    </div>

                    {/* Great Pause Button */}
                    {!isPaused ? (
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/20 border-2 border-red-500/50 rounded-lg text-red-400 font-bold hover:bg-red-500/30 transition-all disabled:opacity-50"
                        >
                            <Power className="h-5 w-5" />
                            <span>TRIGGER GREAT PAUSE</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleResume}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500/20 border-2 border-green-500/50 rounded-lg text-green-400 font-bold hover:bg-green-500/30 transition-all disabled:opacity-50"
                        >
                            <Play className="h-5 w-5" />
                            <span>RESUME TRADING</span>
                        </button>
                    )}

                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-400">
                            <strong>Warning:</strong> The Great Pause will immediately halt all automated trading across the platform.
                            Use only in emergency situations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1B1B1B] border-2 border-red-500/50 rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            <h3 className="text-xl font-bold text-red-400">Confirm Great Pause</h3>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">
                            This will immediately stop all automated trading across the entire platform.
                            Please provide a reason for this action.
                        </p>
                        <textarea
                            value={pauseReason}
                            onChange={(e) => setPauseReason(e.target.value)}
                            placeholder="Enter reason for pause..."
                            className="w-full px-4 py-3 bg-[#252525] border border-[#00F2FF]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setPauseReason("");
                                }}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-[#252525] border border-[#00F2FF]/30 rounded-lg text-white hover:bg-[#00F2FF]/10 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGreatPause}
                                disabled={isSubmitting || !pauseReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-500 rounded-lg text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Pausing...' : 'Confirm Pause'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
            />
        </>
    );
}
