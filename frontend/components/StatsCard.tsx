import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { Skeleton } from "@/components/Skeleton";

interface StatsCardProps {
    label: string;
    value: string;
    icon?: LucideIcon;
    change?: string;
    trend?: "up" | "down" | "neutral";
    color?: "default" | "green" | "red";
    theme?: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "default";
    isLoading?: boolean;
}

const THEMES = {
    default: "border-border bg-card",
    indigo: "border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-500",
    emerald: "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500",
    amber: "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500",
    rose: "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500",
    cyan: "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-500",
};

export function StatsCard({ label, value, icon: Icon, change, trend, color = "default", theme = "default", isLoading }: StatsCardProps) {
    const themeClass = THEMES[theme] || THEMES.default;
    const isColored = theme !== "default";

    return (
        <div className={clsx("rounded-xl border p-4 shadow-sm transition-all duration-300", themeClass)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={clsx("text-sm font-medium", isColored ? "opacity-80" : "text-muted-foreground")}>{label}</p>
                    {isLoading ? (
                        <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                        <h3 className={clsx("text-2xl font-black mt-1 tracking-tight", {
                            "text-foreground": color === "default" && !isColored,
                            "text-primary": color === "green",
                            "text-destructive": color === "red",
                            // If colored theme, let text inherit or be specific
                        })}>
                            {value}
                        </h3>
                    )}
                </div>
                {Icon && (
                    <div className={clsx("p-2 rounded-lg", isColored ? "bg-white/10" : "bg-secondary/50")}>
                        <Icon className={clsx("h-5 w-5", isColored ? "text-current" : "text-muted-foreground")} />
                    </div>
                )}
            </div>
            {change && !isLoading && (
                <div className="mt-2 flex items-center text-xs">
                    <span className={clsx("font-bold", {
                        "text-emerald-500": trend === "up",
                        "text-red-500": trend === "down",
                        "text-muted-foreground": trend === "neutral"
                    })}>
                        {change}
                    </span>
                </div>
            )}
        </div>
    );
}
