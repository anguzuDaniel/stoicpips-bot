"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType, title?: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType, title?: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type, title }]);

        // Auto dismiss after 5s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className={`
                        pointer-events-auto
                        flex items-start gap-3 p-4 rounded-lg shadow-lg border w-80 animate-in slide-in-from-right-full duration-300 backdrop-blur-md bg-card/95
                        ${toast.type === 'success' ? 'border-green-500/30 shadow-green-500/10' :
                            toast.type === 'error' ? 'border-red-500/30 shadow-red-500/10' :
                                toast.type === 'warning' ? 'border-amber-500/30 shadow-amber-500/10' : 'border-blue-500/30 shadow-blue-500/10'}
                    `}>
                        <div className="mt-0.5 shrink-0">
                            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                            {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            {toast.title && <h4 className="font-semibold text-sm mb-0.5 truncate">{toast.title}</h4>}
                            <p className="text-sm text-muted-foreground break-words">{toast.message}</p>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground shrink-0 ml-2">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
