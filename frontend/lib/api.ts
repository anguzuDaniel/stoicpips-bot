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
    let token = localStorage.getItem("token");

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
};
