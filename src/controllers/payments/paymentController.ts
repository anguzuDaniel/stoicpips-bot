import { Response } from 'express';
import axios from 'axios';
const { supabase } = require('../../config/supabase');

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_WEBHOOK_HASH = process.env.FLW_WEBHOOK_HASH;
// If frontend is on Vercel/Prod, update this var.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const PRICES = {
    pro: 10,
    elite: 50
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

        const payload = {
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

        const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
            headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
        });

        if (response.data.status === 'success') {
            return res.json({ link: response.data.data.link });
        } else {
            return res.status(400).json({ error: "Failed to create payment link." });
        }

    } catch (error: any) {
        console.error("Payment Init Error:", error.response?.data || error.message);
        return res.status(500).json({ error: "Payment Initialization Failed" });
    }
};

export const handleWebhook = async (req: any, res: Response) => {
    try {
        // Validate Signature
        const hash = req.headers['verif-hash'];
        if (!hash || hash !== FLW_WEBHOOK_HASH) {
            // Return 200 to FLW but don't process, to avoid retries if we error 401
            // Actually FLW expects 200, otherwise retries.
            // But if unauthorized, we should just return 200 and ignore.
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
            if (data.status === 'successful' && data.amount >= 20) { // Minimal check, or check PRICES[tier]
                const { user_id, tier } = data.meta;

                console.log(`✅ Payment Verified for User ${user_id}: ${tier}`);

                // Update DB
                const { error } = await supabase.from('profiles').update({
                    subscription_tier: tier,
                    subscription_start_date: new Date().toISOString(),
                    last_payment_ref: data.tx_ref
                }).eq('id', user_id);

                if (error) console.error("Database Update Failed:", error);
                else console.log("Database updated successfully.");
            }
        }

        res.status(200).send("OK");

    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(200).send("OK");
    }
};
