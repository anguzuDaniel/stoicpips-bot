"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const supabase_1 = require("../../config/supabase");
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Email & password required" });
    const { data, error } = await supabase_1.supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user)
        return res.status(401).json({ error: error?.message || "Login failed" });
    res.json({ user: data.user, session: data.session });
};
exports.loginUser = loginUser;
