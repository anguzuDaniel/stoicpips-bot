"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { time: "09:00", price: 9886 },
    { time: "09:05", price: 9914 },
    { time: "09:10", price: 9890 },
    { time: "09:15", price: 9880 },
    { time: "09:20", price: 9860 },
    { time: "09:25", price: 9850 },
    { time: "09:30", price: 9875 },
    { time: "09:35", price: 9885 },
    { time: "09:40", price: 9895 },
    { time: "09:45", price: 9880 },
    { time: "09:50", price: 9870 },
    { time: "09:55", price: 9860 },
    { time: "10:00", price: 9855 },
    { time: "10:05", price: 9865 },
    { time: "10:10", price: 9870 },
];

export function TradingChart() {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 12 }}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        width={60}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
                        itemStyle={{ color: '#ef4444' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
