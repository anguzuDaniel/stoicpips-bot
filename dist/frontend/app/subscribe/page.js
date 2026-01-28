'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useState } from 'react';
const plans = {
    monthly: {
        name: 'Monthly',
        price: '$49',
        period: 'month',
        description: 'Perfect for testing our trading bot',
        features: [
            'Full access to Stoic Pips Bot',
            'All VIX pairs (10-250)',
            '24/7 automated trading',
            'Real-time signals & alerts',
            'Risk management tools',
            'Email support'
        ]
    },
    yearly: {
        name: 'Yearly',
        price: '$490',
        period: 'year',
        description: 'Best value - 2 months free',
        features: [
            'Everything in Monthly plan',
            'Save $98 per year',
            'Priority customer support',
            'Advanced analytics',
            'Custom strategy requests',
            'Dedicated account manager'
        ],
        popular: true
    }
};
export default function Subscribe() {
    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const currentPlan = plans[selectedPlan];
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsx(Navbar, {}), _jsx("main", { className: "py-8 px-4 sm:py-12", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8 sm:mb-12", children: [_jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-gray-800 mb-4", children: "Upgrade to Premium" }), _jsx("p", { className: "text-lg text-gray-600 max-w-2xl mx-auto", children: "Unlock full access to the Stoic Pips Trading Bot and start automating your VIX trading today" })] }), _jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "bg-gray-100 rounded-lg p-1 flex", children: Object.keys(plans).map((plan) => (_jsx("button", { onClick: () => setSelectedPlan(plan), className: `px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${selectedPlan === plan
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'}`, children: plans[plan].name }, plan))) }) }), _jsx("div", { className: "max-w-md mx-auto", children: _jsxs("div", { className: "bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden", children: [currentPlan.popular && (_jsx("div", { className: "bg-blue-500 text-white text-center py-2", children: _jsx("span", { className: "text-sm font-medium", children: "Most Popular" }) })), _jsxs("div", { className: "p-6 sm:p-8 text-center border-b border-gray-200", children: [_jsxs("h3", { className: "text-2xl font-bold text-gray-800 mb-2", children: [currentPlan.name, " Plan"] }), _jsxs("div", { className: "flex items-baseline justify-center mb-4", children: [_jsx("span", { className: "text-4xl sm:text-5xl font-bold text-gray-800", children: currentPlan.price }), _jsxs("span", { className: "text-gray-600 ml-2", children: ["/", currentPlan.period] })] }), _jsx("p", { className: "text-gray-600", children: currentPlan.description })] }), _jsxs("div", { className: "p-6 sm:p-8", children: [_jsx("ul", { className: "space-y-4 mb-8", children: currentPlan.features.map((feature, index) => (_jsxs("li", { className: "flex items-start", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), _jsx("span", { className: "text-gray-700", children: feature })] }, index))) }), _jsx("button", { className: "w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 font-semibold text-lg", children: "Subscribe Now" }), _jsxs("div", { className: "mt-4 text-center", children: [_jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Secure payment processed by" }), _jsxs("div", { className: "flex justify-center items-center space-x-4", children: [_jsx("span", { className: "text-gray-700 text-sm font-medium", children: "Stripe" }), _jsx("span", { className: "text-gray-300", children: "\u2022" }), _jsx("span", { className: "text-gray-700 text-sm font-medium", children: "Paddle" })] })] })] })] }) }), _jsxs("div", { className: "mt-12 sm:mt-16 max-w-3xl mx-auto", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 text-center mb-8", children: "Frequently Asked Questions" }), _jsx("div", { className: "space-y-6", children: [
                                        {
                                            question: "How does the free trial work?",
                                            answer: "The free trial gives you full access to the trading bot for a limited time. No credit card required to start."
                                        },
                                        {
                                            question: "Can I cancel my subscription?",
                                            answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
                                        },
                                        {
                                            question: "What payment methods do you accept?",
                                            answer: "We accept all major credit cards through Stripe and Paddle. More payment options coming soon."
                                        },
                                        {
                                            question: "Is there a setup fee?",
                                            answer: "No, there are no hidden fees. You only pay the monthly or yearly subscription price."
                                        }
                                    ].map((faq, index) => (_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-gray-800 mb-2", children: faq.question }), _jsx("p", { className: "text-gray-600", children: faq.answer })] }, index))) })] }), _jsx("div", { className: "mt-12 text-center", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-blue-600", children: "\uD83D\uDD12" }) }), _jsx("h4", { className: "font-semibold text-gray-800 mb-1", children: "Secure" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Bank-level security" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-green-600", children: "\u21BB" }) }), _jsx("h4", { className: "font-semibold text-gray-800 mb-1", children: "Cancel Anytime" }), _jsx("p", { className: "text-gray-600 text-sm", children: "No long-term contracts" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-purple-600", children: "\uD83D\uDCAC" }) }), _jsx("h4", { className: "font-semibold text-gray-800 mb-1", children: "Support" }), _jsx("p", { className: "text-gray-600 text-sm", children: "24/7 customer support" })] })] }) })] }) }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=page.js.map