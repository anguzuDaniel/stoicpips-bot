import { Response } from "express";
import { supabase } from '../../config/supabase';

/**
 * Updates the user's card information.
 * @param req - The request object containing the user and card info.
 * @param res - The response object.
 */
export const updateBankInfo = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { bankName, accountNumber, accountName } = req.body;

        if (!bankName || !accountNumber || !accountName) {
            return res.status(400).json({ error: "All card information fields (Cardholder Name, Card Number, Expiry) are required." });
        }

        const { data, error } = await supabase
            .from("profiles")
            .update({
                bank_name: bankName,
                account_number: accountNumber,
                account_name: accountName,
                updated_at: new Date().toISOString()
            })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("Update card info error:", error.message);
            return res.status(400).json({ error: "Failed to update card information." });
        }

        res.json({
            message: "Card information updated successfully.",
            cardInfo: {
                cardholderName: data.bank_name,
                cardNumber: data.account_number,
                expiryDate: data.account_name
            }
        });

    } catch (err: any) {
        console.error("updateCardInfo error:", err);
        res.status(500).json({ error: "Server error while updating card information." });
    }
};
