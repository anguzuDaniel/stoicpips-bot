"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Retrieves the current authenticated user's session and profile.
 */
const getSession = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: "No token provided" });
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user)
            return res.status(401).json({ error: error?.message || "Invalid session" });
        // Fetch full profile from the profiles table
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        res.json({ user, profile });
    }
    catch (err) {
        console.error("getSession error:", err);
        res.status(500).json({ error: "Server error while fetching session" });
    }
};
exports.getSession = getSession;
