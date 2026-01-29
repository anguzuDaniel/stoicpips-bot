"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBankInfo = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Updates the user's bank account information.
 * @param req - The request object containing the user and bank info.
 * @param res - The response object.
 */
const updateBankInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bankName, accountNumber, accountName } = req.body;
        if (!bankName || !accountNumber || !accountName) {
            return res.status(400).json({ error: "All bank account fields (Bank Name, Account Number, Account Name) are required." });
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
            console.error("Update bank info error:", error.message);
            return res.status(400).json({ error: "Failed to update bank account information." });
        }
        res.json({
            message: "Bank account information updated successfully.",
            bankInfo: {
                bankName: data.bank_name,
                accountNumber: data.account_number,
                accountName: data.account_name
            }
        });
    }
    catch (err) {
        console.error("updateBankInfo error:", err);
        res.status(500).json({ error: "Server error while updating bank information." });
    }
};
exports.updateBankInfo = updateBankInfo;
