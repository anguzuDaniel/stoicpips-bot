'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
export default function Settings() {
    const [user, setUser] = useState(null);
    const [hasPaid, setHasPaid] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            // In a real app, you'd check payment status from your backend
            setHasPaid(Math.random() > 0.5); // Mock payment status
        };
        getUser();
    }, []);
    const handleUpgrade = async () => {
        setIsLoading(true);
        // Mock upgrade process
        setTimeout(() => {
            setHasPaid(true);
            setMessage({ type: 'success', text: 'Successfully upgraded to Premium!' });
            setIsLoading(false);
        }, 1500);
    };
    if (!user) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Settings" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage your account and preferences" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: _jsx("nav", { className: "space-y-2", children: [
                                        { id: 'account', name: 'Account', icon: '👤' },
                                        { id: 'billing', name: 'Billing & Plan', icon: '💳' },
                                        { id: 'notifications', name: 'Notifications', icon: '🔔' },
                                        { id: 'security', name: 'Security', icon: '🔒' },
                                        { id: 'api', name: 'API Keys', icon: '🔑' },
                                        { id: 'preferences', name: 'Preferences', icon: '⚙️' },
                                    ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`, children: [_jsx("span", { className: "text-lg", children: tab.icon }), _jsx("span", { className: "font-medium", children: tab.name })] }, tab.id))) }) }) }), _jsxs("div", { className: "lg:col-span-3", children: [message.text && (_jsx("div", { className: `mb-6 p-4 rounded-xl border ${message.type === 'success'
                                        ? 'bg-green-50 border-green-200 text-green-800'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'}`, children: message.text })), _jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Account Information" }), _jsx("p", { className: "text-gray-600 text-sm mt-1", children: "Manage your account details and subscription" })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-semibold text-gray-700", children: "Account Status" }), _jsx("div", { className: `px-3 py-1 rounded-full text-sm font-medium ${hasPaid
                                                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                                                : 'bg-blue-100 text-blue-800 border border-blue-200'}`, children: hasPaid ? 'Premium' : 'Free Trial' })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600 text-sm", children: "Plan" }), _jsx("span", { className: "text-gray-900 font-medium", children: hasPaid ? 'Premium Plan' : 'Free Trial' })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600 text-sm", children: "Billing Cycle" }), _jsx("span", { className: "text-gray-900 font-medium", children: hasPaid ? 'Monthly' : '14 Days Left' })] })] })] }), _jsxs("div", { className: "bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200", children: [_jsx("h3", { className: "font-semibold text-gray-700 mb-4", children: "Profile Details" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600 text-sm", children: "Email" }), _jsx("span", { className: "text-gray-900 font-medium truncate ml-2 max-w-[150px]", children: user.email })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600 text-sm", children: "Member Since" }), _jsx("span", { className: "text-gray-900 font-medium", children: new Date(user.created_at).toLocaleDateString('en-US', {
                                                                                        year: 'numeric',
                                                                                        month: 'long',
                                                                                        day: 'numeric'
                                                                                    }) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600 text-sm", children: "Last Login" }), _jsx("span", { className: "text-gray-900 font-medium", children: new Date().toLocaleDateString() })] })] })] })] }), !hasPaid && (_jsx("div", { className: "mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { className: "mb-4 md:mb-0", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Upgrade to Premium" }), _jsx("p", { className: "text-blue-100 text-sm", children: "Unlock advanced features, priority support, and enhanced analytics" }), _jsxs("ul", { className: "text-blue-100 text-sm mt-3 space-y-1", children: [_jsx("li", { children: "\u2713 Advanced trading algorithms" }), _jsx("li", { children: "\u2713 Real-time market data" }), _jsx("li", { children: "\u2713 Priority customer support" }), _jsx("li", { children: "\u2713 Custom indicators" })] })] }), _jsx("button", { onClick: handleUpgrade, disabled: isLoading, className: "bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap", children: isLoading ? 'Processing...' : 'Upgrade Now - $29/month' })] }) })), _jsxs("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("button", { className: "flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 group", children: [_jsx("span", { className: "text-gray-400 group-hover:text-blue-600", children: "\uD83D\uDCE7" }), _jsx("span", { className: "text-gray-700 font-medium", children: "Update Email" })] }), _jsxs("button", { className: "flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 group", children: [_jsx("span", { className: "text-gray-400 group-hover:text-blue-600", children: "\uD83D\uDD11" }), _jsx("span", { className: "text-gray-700 font-medium", children: "Change Password" })] })] })] })] }), _jsx("div", { className: "mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: _jsx("div", { className: "text-center text-gray-500 py-8", children: _jsx("p", { children: "Select a category from the sidebar to manage additional settings" }) }) })] })] })] }) }));
}
//# sourceMappingURL=page.js.map