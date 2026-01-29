"use client";

import { clsx } from "clsx";

interface ConfidenceGaugeProps {
    value: number; // 0 to 100
    isLoading?: boolean;
}

export function ConfidenceGauge({ value, isLoading }: ConfidenceGaugeProps) {
    // Clamp value between 0 and 100
    const percentage = Math.min(Math.max(value, 0), 100);

    // Determine color based on confidence
    let colorClass = "text-red-500 stroke-red-500";
    if (percentage >= 75) colorClass = "text-green-500 stroke-green-500";
    else if (percentage >= 50) colorClass = "text-yellow-500 stroke-yellow-500";

    // SVG parameters for semi-circle
    const radius = 40;
    const strokeWidth = 8;
    const circumference = Math.PI * radius; // Half circle
    const progress = (percentage / 100) * circumference;

    // Dash array for semi-circle: progress filled, rest empty
    // Actually simpler: Full circle is 2*PI*r. We want arch.
    // Standard gauge implementation:

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-4 h-[120px] bg-secondary/10 rounded-xl animate-pulse">
                <div className="h-16 w-32 rounded-t-full bg-secondary/20" />
                <div className="h-4 w-16 bg-secondary/20 mt-2 rounded" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center relative">
            <div className="relative w-40 h-24 flex items-end justify-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 60">
                    {/* Background Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-secondary/20"
                        strokeLinecap="round"
                    />
                    {/* Progress Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className={clsx("transition-all duration-1000 ease-out", colorClass)}
                        strokeLinecap="round"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={circumference - progress}
                    />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center mb-2">
                    <span className={clsx("text-2xl font-bold", colorClass)}>
                        {percentage}%
                    </span>
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Confidence</span>
                </div>
            </div>

            <div className="text-center mt-2 px-3 py-1 bg-secondary/30 rounded text-xs text-muted-foreground w-full">
                {percentage >= 80 ? "High Probability" : percentage >= 50 ? "Neutral Market" : "Low Probability"}
            </div>
        </div>
    );
}
