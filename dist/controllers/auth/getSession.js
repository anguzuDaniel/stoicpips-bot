"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = void 0;
const { supabase } = require('../../config/supabase');
const getSession = async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token)
        return res.status(401).json({ error: "Not authenticated" });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user)
        return res.status(401).json({ error: "Invalid token" });
    res.json({ user: data.user });
};
exports.getSession = getSession;
