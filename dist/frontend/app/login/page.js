'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error)
            setError(error.message);
        else
            router.push('/dashboard');
        setLoading(false);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: "absolute top-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" }), _jsx("div", { className: "absolute bottom-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" })] }), _jsxs("div", { className: "relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-purple-500/10", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center", children: _jsx("span", { className: "text-xl font-bold text-white", children: "\u26A1" }) }) }), _jsx("h1", { className: "text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2", children: "Welcome Back" }), _jsx("p", { className: "text-gray-400 text-center mb-8", children: "Sign in to your trading dashboard" }), error && (_jsx("div", { className: "mb-6 p-4 backdrop-blur-lg bg-red-500/10 border border-red-400/20 rounded-xl text-red-400 text-sm", children: error })), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Email" }), _jsx("input", { type: "email", placeholder: "Enter your email", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Password" }), _jsx("input", { type: "password", placeholder: "Enter your password", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center", children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" }), "Signing In..."] })) : ('Sign In') })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-gray-400 text-sm", children: ["Don't have an account?", ' ', _jsx(Link, { href: "/register", className: "text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-semibold", children: "Create one" })] }) }), _jsx("div", { className: "mt-6 p-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg", children: _jsx("p", { className: "text-xs text-gray-400 text-center", children: "\uD83D\uDD12 Secure authentication powered by Supabase" }) })] })] }));
}
//# sourceMappingURL=page.js.map