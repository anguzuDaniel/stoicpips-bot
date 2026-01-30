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
        console.log(`🔍 [getUserProfile] Fetching profile for user: ${userId}`);
        const { data, error } = await supabase_1.supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        console.log(`🔍 [getUserProfile] Result:`, { data, error });
        if (error) {
            if (error.code === 'PGRST116') {
                // No profile found, return null user so frontend can show empty form
                return res.json({ user: null });
            }
            console.error(`❌ [${userId}] Fetch profile error:`, error.message);
            return res.status(400).json({ error: error.message });
        }
        res.json({
            user: {
                ...data,
                is_email_verified: req.user.isEmailVerified
            }
        });
    }
    catch (err) {
        console.error("getUserProfile error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getUserProfile = getUserProfile;
