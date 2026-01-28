"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getBotConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from("bot_configs")
            .select("config_data")
            .eq("user_id", userId)
            .single();
        if (error && error.code !== 'PGRST116') {
            return res.status(400).json({ error: error.message });
        }
        res.json({
            config: data?.config_data || {},
            user: {
                id: userId,
                subscription: req.user.subscription_status
            }
        });
    }
    catch (error) {
        console.error('Get bot config error:', error);
        res.status(500).json({ error: 'Failed to get bot configuration' });
    }
};
module.exports = getBotConfig;
