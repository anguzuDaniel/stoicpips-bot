"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupUser = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Handles user signup and creates an initial entry in the profiles table.
 */
const signupUser = async (req, res) => {
    try {
        const { email, password, first_name } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email & password required" });
        const { data, error } = await supabase_1.supabase.auth.signUp({
            email,
            password,
            options: {
                data: { first_name },
                emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`
            }
        });
        if (error) {
            console.error(`❌ Signup failure for ${email}:`, error.message);
            return res.status(error.status || 400).json({ error: error.message });
        }
        if (data.user) {
            // Initial profile creation is usually handled by Supabase triggers, 
            // but we can ensure it here if triggers are not set up.
            await supabase_1.supabase.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email,
                subscription_tier: 'free',
                subscription_status: 'inactive'
            });
        }
        res.status(201).json({ user: data.user });
    }
    catch (err) {
        console.error("Signup controller error:", err);
        res.status(500).json({ error: "Server error during signup" });
    }
};
exports.signupUser = signupUser;
