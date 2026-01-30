"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBankInfo = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Updates the user's card information.
 * @param req - The request object containing the user and card info.
 * @param res - The response object.
 */
const updateBankInfo = async (req, res) => {
    try {
        const userId = req.user?.id;
        const body = req.body;
        console.log(`[DEBUG] Update Card Info request for user: ${userId}`);
        console.log(`[DEBUG] Received body:`, body);
        if (!userId) {
            return res.status(401).json({ error: "User ID missing from request." });
        }
        const { bankName, accountNumber, accountName } = body;
        if (!bankName || !accountNumber || !accountName) {
            return res.status(400).json({ error: "All card information fields (Cardholder Name, Card Number, Expiry) are required." });
        }
        const { data, error } = await supabase_1.supabase
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
            console.error("Update card info DB error:", error.message);
            return res.status(400).json({ error: `Failed to update card information: ${error.message}` });
        }
        if (!data) {
            console.error("Update card info - No data returned after update.");
            return res.status(404).json({ error: "Profile not found or no changes made." });
        }
        res.json({
            message: "Card information updated successfully.",
            cardInfo: {
                cardholderName: data.bank_name,
                cardNumber: data.account_number,
                expiryDate: data.account_name
            }
        });
    }
    catch (err) {
        console.error("updateCardInfo exception:", err);
        res.status(500).json({
            error: "Server error while updating card information.",
            details: err.message
        });
    }
};
exports.updateBankInfo = updateBankInfo;
