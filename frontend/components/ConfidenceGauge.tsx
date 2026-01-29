"use client";

import { Skeleton } from "./Skeleton";

interface ConfidenceGaugeProps {
    value: number; // 0 to 100
    isLoading?: boolean;
}

export function ConfidenceGauge({ value, isLoading }: ConfidenceGaugeProps) {
    if (isLoading) {
        return <Skeleton className="h-4 w-full mt-2" />;
    }

    const getColor = (v: number) => {
        if (v >= 80) return "bg-green-500";
        if (v >= 60) return "bg-emerald-500";
        if (v >= 40) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold">
                <span>Signal Confidence</span>
                <span>{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${getColor(value)}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
