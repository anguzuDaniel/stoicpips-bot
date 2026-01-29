"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Fetches the user profile from the profiles table.
 */
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase_1.supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        if (error) {
            console.error(`❌ [${userId}] Fetch profile error:`, error.message);
            return res.status(400).json({ error: error.message });
        }
        res.json({ user: data });
    }
    catch (err) {
        console.error("getUserProfile error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getUserProfile = getUserProfile;
