"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { differenceInDays, addDays } from "date-fns";
import { Loader2 } from "lucide-react";

interface TrialGateProps {
    children: React.ReactNode;
}

export function TrialGate({ children }: TrialGateProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: profile, mutate } = useSWR('/user/profile', fetcher);

    const user = profile?.user;

    useEffect(() => {
        if (!user) return;

        // Skip check for certain pages
        const publicPages = ['/login', '/signup', '/reset-password', '/update-password', '/trial-expired', '/pricing', '/help'];
        if (publicPages.includes(pathname)) return;

        const hasTrialStarted = user.has_started_trial;
        const isSubscribed = user.is_subscribed || user.subscription_status === 'active';
        const trialStartDate = user.trial_start_date;

        // 1. If trial hasn't started, we'll let the Dashboard handle the trigger
        // when the user clicks 'Start Bot' for the first time.
        if (!hasTrialStarted && !isSubscribed) {
            // setShowStartModal(true); // Removed automatic trigger
            return;
        }

        // 2. If trial has started, check for expiry
        if (hasTrialStarted && !isSubscribed && trialStartDate) {
            const expiryDate = addDays(new Date(trialStartDate), 7);
            const isExpired = differenceInDays(expiryDate, new Date()) < 0;

            if (isExpired) {
                router.push('/trial-expired');
            }
        }
    }, [user, pathname, router]);

    if (!user && !['/login', '/signup', '/reset-password', '/update-password', '/trial-expired'].includes(pathname)) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
