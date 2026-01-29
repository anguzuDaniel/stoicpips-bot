import { Response } from "express";
import { supabase } from '../../config/supabase';

/**
 * Updates the user's profile information.
 */
export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const { fullName, username, tradingExperience, bankName, accountNumber, accountName } = req.body;

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (fullName !== undefined) updateData.full_name = fullName;
        if (username !== undefined) updateData.username = username;
        if (tradingExperience !== undefined) updateData.trading_experience = tradingExperience;

        // Map card info to the database columns (bank_name, account_number, account_name)
        if (bankName !== undefined) updateData.bank_name = bankName;
        if (accountNumber !== undefined) updateData.account_number = accountNumber;
        if (accountName !== undefined) updateData.account_name = accountName;

        const { data, error } = await supabase
            .from("profiles")
            .upsert({
                ...updateData,
                id: userId
            })
            .select()
            .single();

        if (error) {
            console.error("Update profile DB error:", error.message);
            return res.status(400).json({ error: `Failed to update profile: ${error.message}` });
        }

        res.json({
            message: "Profile updated successfully.",
            user: data
        });

    } catch (err: any) {
        console.error("updateProfile exception:", err);
        res.status(500).json({
            error: "Server error while updating profile information.",
            details: err.message
        });
    }
};
