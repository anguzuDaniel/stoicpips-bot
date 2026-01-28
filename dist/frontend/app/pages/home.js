import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import Link from 'next/link';
export default function Home() {
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("main", { className: "p-8 text-center", children: [_jsx("h1", { className: "text-4xl font-bold", children: "Welcome to Stoic Pips Bot" }), _jsx("p", { className: "mt-4", children: "Automated trading for VIX 10 & 25. Only for paid clients." }), _jsxs("div", { className: "mt-6 space-x-4", children: [_jsx(Link, { href: "/register", children: _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", children: "Register" }) }), _jsx(Link, { href: "/login", children: _jsx("button", { className: "px-4 py-2 bg-gray-600 text-white rounded", children: "Login" }) })] })] }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=home.js.map