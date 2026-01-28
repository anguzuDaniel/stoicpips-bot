import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface StatsCardProps {
    label: string;
    value: string;
    icon?: LucideIcon;
    change?: string;
    trend?: "up" | "down" | "neutral";
    color?: "default" | "green" | "red";
}

export function StatsCard({ label, value, icon: Icon, change, trend, color = "default" }: StatsCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <h3 className={clsx("text-2xl font-bold mt-1", {
                        "text-foreground": color === "default",
                        "text-primary": color === "green",
                        "text-destructive": color === "red",
                    })}>
                        {value}
                    </h3>
                </div>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            {change && (
                <div className="mt-2 flex items-center text-xs">
                    <span className={clsx("font-medium", {
                        "text-primary": trend === "up",
                        "text-destructive": trend === "down",
                        "text-muted-foreground": trend === "neutral"
                    })}>
                        {change}
                    </span>
                </div>
            )}
        </div>
    );
}
