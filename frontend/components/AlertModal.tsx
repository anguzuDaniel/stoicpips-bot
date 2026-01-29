"use client";
import { X, AlertCircle, CheckCircle } from "lucide-react";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: "error" | "success" | "info";
}

export function AlertModal({ isOpen, onClose, title, message, type = "error" }: AlertModalProps) {
    if (!isOpen) return null;

    const isError = type === "error";
    const iconColor = isError ? "text-red-500" : type === "success" ? "text-green-500" : "text-blue-500";
    const borderColor = isError ? "border-red-500/50" : type === "success" ? "border-green-500/50" : "border-blue-500/50";
    const shadowColor = isError ? "shadow-red-500/20" : type === "success" ? "shadow-green-500/20" : "shadow-blue-500/20";
    const btnGradient = isError ? "from-red-500 to-red-700 hover:from-red-600 hover:to-red-800" : "from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-md bg-card border ${borderColor} rounded-xl shadow-[0_0_30px_${shadowColor}] p-6 animate-in zoom-in-95 duration-200`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-secondary/50 border ${borderColor}`}>
                        {type === 'success' ? <CheckCircle className={`h-6 w-6 ${iconColor}`} /> : <AlertCircle className={`h-6 w-6 ${iconColor}`} />}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">
                            {title || (isError ? "Error" : "System Notification")}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-full bg-gradient-to-r ${btnGradient} text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        Okay
                    </button>
                </div>
            </div>
        </div>
    );
}
