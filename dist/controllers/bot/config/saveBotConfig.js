"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBotConfig = void 0;
const supabase_1 = require("../../../config/supabase");
const saveBotConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const config = req.body;
        const { data, error } = await supabase_1.supabase
            .from("bot_configs")
            .upsert({ user_id: userId, ...config, updated_at: new Date() })
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.saveBotConfig = saveBotConfig;
