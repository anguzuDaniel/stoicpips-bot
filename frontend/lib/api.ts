import axios, { AxiosResponse } from "axios";

export const fetcher = (url: string) => api.get(url).then(res => res.data);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptor to include token if we implement auth
api.interceptors.request.use(async (config) => {
    // Try to get token from localStorage first (if you save it there)
    let token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    // Or get it from supabase session
    if (!token) {
        const { supabase } = await import("./supabase");
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || null;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export const userApi = {
    // User endpoints
    getProfile: () => api.get("/user/profile"),
    updateProfile: (data: { fullName?: string, username?: string, tradingExperience?: string, bankName?: string, accountNumber?: string, accountName?: string }) => api.post("/user/update-profile", data),
    updateBankInfo: (data: any) => api.post("/user/update-bank-info", data),
    reportBug: (data: any) => api.post("/user/report-bug", data),
    getNotifications: () => api.get("/user/notifications"),
    markNotificationRead: (id: string) => api.patch(`/user/notifications/${id}/read`),
    markAllNotificationsRead: () => api.patch("/user/notifications/read-all"),
};

export const botApi = {
    getConfigs: () => api.get("/bot/config"),
    saveConfig: (data: any) => api.post("/bot/config", data),
    startBot: () => api.post("/bot/start"),
    stopBot: () => api.post("/bot/stop"),
    getStatus: () => api.get("/bot/status"),
    forceTrade: (data: { amount: number; symbol: string; contractType: 'CALL' | 'PUT'; duration: number }) => api.post("/bot/force-trade", data),
    getHistory: (params?: { page?: number; limit?: number; status?: string }) => api.get("/bot/history", { params }),
    getAnalytics: () => api.get("/bot/analytics"),
    getLogs: () => api.get("/bot/logs"),

    resetBot: () => api.post("/bot/reset", {}),
    toggleAccount: (type: 'real' | 'demo') => api.post("/bot/toggle-account", { targetType: type }),
    initializePayment: (tier: 'pro' | 'elite') => api.post("/payments/initialize", { tier }),
    getAnnouncements: () => api.get("/admin/announcements"),
};

export const adminApi = {
    // Infrastructure
    getInfrastructureHealth: () => api.get("/admin/infrastructure/health"),

    // Users
    listUsers: () => api.get("/admin/users"),
    updateUserTier: (userId: string, tier: string) => api.patch(`/admin/users/${userId}/tier`, { tier }),

    // Bot Control
    getGlobalBotStatus: () => api.get("/admin/bot/status"),
    triggerGreatPause: (reason: string) => api.post("/admin/bot/pause", { reason }),
    resumeTrading: () => api.post("/admin/bot/resume"),

    // Analytics
    getGlobalAnalytics: () => api.get("/admin/analytics/global"),

    // Announcements
    createAnnouncement: (data: { title: string, message: string, type: string, expiresAt?: string }) => api.post("/admin/announcements", data),
    getAnnouncementHistory: () => api.get("/admin/announcements/all"),
    deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),

    // Bug Reports
    getBugReports: () => api.get("/admin/bug-reports"),
    updateBugReportStatus: (id: string, status: string) => api.patch(`/admin/bug-reports/${id}/status`, { status }),
};
