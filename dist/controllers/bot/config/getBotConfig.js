"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBotConfig = void 0;
const supabase_1 = require("../../../config/supabase");
const getBotConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase_1.supabase
            .from("bot_configs")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        res.json(data || {});
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBotConfig = getBotConfig;
