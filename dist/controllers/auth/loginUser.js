"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Handles user login and returns user/session data.
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email & password required" });
        const { data, error } = await supabase_1.supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
            console.error(`❌ Login failure for ${email}:`, error?.message);
            return res.status(401).json({ error: error?.message || "Login failed" });
        }
        // Fetch profile to ensure it exists for the user
        await supabase_1.supabase.from('profiles').select('id').eq('id', data.user.id).single();
        res.json({ user: data.user, session: data.session });
    }
    catch (err) {
        console.error("Login controller error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
};
exports.loginUser = loginUser;
