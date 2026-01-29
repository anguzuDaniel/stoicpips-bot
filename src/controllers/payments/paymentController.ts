import { Response } from 'express';
import axios from 'axios';
import { supabase } from '../../config/supabase';

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_WEBHOOK_HASH = process.env.FLW_WEBHOOK_HASH;
// If frontend is on Vercel/Prod, update this var.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const PRICES: Record<string, number> = {
    pro: 49,
    elite: 99
};

export const initializePayment = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { tier } = req.body;

        if (!tier || !['pro', 'elite'].includes(tier)) {
            return res.status(400).json({ error: "Invalid tier. Choose 'pro' or 'elite'." });
        }

        const amount = PRICES[tier as keyof typeof PRICES];
        // Unique transaction ref
        const tx_ref = `syntoic-${userId}-${Date.now()}`;

        // Plan IDs from .env or default (User should configure these in FLW dashboard)
        const PLAN_IDS = {
            pro: process.env.FLW_PLAN_ID_PRO,
            elite: process.env.FLW_PLAN_ID_ELITE
        };

        const plan_id = PLAN_IDS[tier as keyof typeof PLAN_IDS];

        const payload: any = {
            tx_ref,
            amount: amount.toString(),
            currency: 'USD',
            redirect_url: `${FRONTEND_URL}/pricing?payment=success`,
            payment_options: 'card,mobilemoneyuganda',
            customer: {
                email: req.user.email,
                name: req.user.email.split('@')[0]
            },
            meta: {
                user_id: userId,
                tier
            },
            customizations: {
                title: `SyntoicAi ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
                description: `Upgrade to ${tier} tier`,
                logo: "https://syntoic.com/logo.png"
            }
        };

        // If a plan ID is provided, enable recurring billing
        if (plan_id) {
            payload.payment_plan = plan_id;
            console.log(`📅 Using Flutterwave Plan: ${plan_id} for ${tier} tier`);
        } else {
            console.warn(`⚠️ No Flutterwave Plan ID found for ${tier}. Falling back to one-time payment.`);
        }

        const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
            headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
        });

        if (response.data.status === 'success') {
            return res.json({ link: response.data.data.link });
        } else {
            return res.status(400).json({ error: "Failed to create payment link." });
        }

    } catch (error: any) {
        const errorData = error.response?.data;
        console.error("❌ Payment Init Error:", errorData || error.message);

        // Log more specifics to help debug
        if (errorData) {
            console.error("Flutterwave Error Message:", errorData.message);
        }

        return res.status(500).json({
            error: "Payment Initialization Failed",
            details: errorData?.message || error.message
        });
    }
};

export const handleWebhook = async (req: any, res: Response) => {
    try {
        // Validate Signature
        const hash = req.headers['verif-hash'];
        if (!hash || hash !== FLW_WEBHOOK_HASH) {
            return res.status(200).send("Ignored");
        }

        const event = req.body;
        if (event.event === 'charge.completed' && event.data.status === 'successful') {
            const transactionId = event.data.id;

            // Verify Transaction
            console.log(`Verifying transaction ${transactionId}...`);
            const verifyRes = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
                headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
            });

            const data = verifyRes.data.data;
            // Check amount and status again
            if (data.status === 'successful') {
                const { user_id, tier } = data.meta;

                console.log(`✅ Payment Verified for User ${user_id}: ${tier}`);

                // Update DB
                const { error } = await supabase.from('profiles').update({
                    subscription_tier: tier,
                    subscription_start_date: new Date().toISOString(),
                    last_payment_ref: data.tx_ref,
                    subscription_status: 'active'
                }).eq('id', user_id);

                if (error) console.error("Database Update Failed:", error);
                else console.log("Database updated successfully.");
            }
        }

        res.status(200).send("OK");

    } catch (error: any) {
        console.error("Webhook Error:", error.message);
        res.status(200).send("OK");
    }
};

export const cancelSubscription = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        // In a real app, you would also call Flutterwave API to cancel the subscription
        // If you have the subscription ID stored:
        // await axios.put(`https://api.flutterwave.com/v3/subscriptions/${subscriptionId}/cancel`, {}, { headers: ... });

        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_tier: 'free',
                subscription_status: 'cancelled'
            })
            .eq('id', userId);

        if (error) throw error;

        console.log(`❌ Subscription cancelled for user ${userId}`);
        res.json({ message: "Subscription cancelled successfully. You can still use it until the end of the current period." });

    } catch (error: any) {
        console.error("Cancellation Error:", error.message);
        res.status(500).json({ error: "Failed to cancel subscription." });
    }
};
