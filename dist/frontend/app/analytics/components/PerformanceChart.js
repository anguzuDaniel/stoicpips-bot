import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export default function PerformanceChart({ data }) {
    const maxProfit = Math.max(...data.map(d => d.profit));
    const minProfit = Math.min(...data.map(d => d.profit));
    return (_jsx("div", { className: "w-full h-full flex items-end justify-between px-4", children: data.map((day, index) => {
            const height = ((day.profit - minProfit) / (maxProfit - minProfit)) * 80 + 20;
            return (_jsxs("div", { className: "flex flex-col items-center space-y-2", children: [_jsxs("div", { className: "text-xs text-gray-500", children: [day.profit >= 0 ? '+' : '', day.profit] }), _jsx("div", { className: `w-8 rounded-t-lg transition-all duration-300 ${day.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`, style: { height: `${Math.max(10, Math.abs(height))}%` } }), _jsx("div", { className: "text-xs text-gray-500", children: day.date })] }, index));
        }) }));
}
//# sourceMappingURL=PerformanceChart.js.map