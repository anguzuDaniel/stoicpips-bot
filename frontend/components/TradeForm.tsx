"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { clsx } from "clsx";

export function TradeForm() {
    const [stake, setStake] = useState(10);
    const [duration, setDuration] = useState("5 ticks");

    return (
        <div className="flex flex-col gap-6">
            <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Stake Amount</label>
                <div className="flex gap-2 mb-2">
                    {[10, 25, 50, 100].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setStake(amount)}
                            className={clsx(
                                "px-3 py-1 rounded-md text-sm border transition-colors",
                                stake === amount
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-transparent hover:bg-accent"
                            )}
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
                <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Duration</label>
                <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option>5 ticks</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
                <button className="flex flex-col items-center justify-center gap-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 py-4 rounded-lg transition-colors">
                    <ArrowUp className="h-6 w-6" />
                    <span className="font-bold">Rise</span>
                    <span className="text-xs opacity-70">Predict Higher</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50 py-4 rounded-lg transition-colors">
                    <ArrowDown className="h-6 w-6" />
                    <span className="font-bold">Fall</span>
                    <span className="text-xs opacity-70">Predict Lower</span>
                </button>
            </div>

            <div className="mt-4 text-center">
                <p className="text-primary font-bold text-xl">$19.50</p>
                <p className="text-xs text-muted-foreground">Potential Payout</p>
            </div>
        </div>
    );
}
