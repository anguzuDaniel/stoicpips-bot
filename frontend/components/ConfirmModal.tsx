"use client";
import { X, HelpCircle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-card border border-amber-500/30 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] p-6 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/30">
                        <HelpCircle className="h-6 w-6 text-amber-500" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">
                            {title || "Confirmation Required"}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {message}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition-colors border border-border"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-all"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
