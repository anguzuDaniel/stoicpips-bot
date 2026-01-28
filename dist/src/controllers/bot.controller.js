import { supabase } from "../../frontend/app/utils/supabaseClient.js";
export const saveBotConfig = async (req, res) => {
    const user = req.user;
    const config = req.body;
    const { error } = await supabase
        .from("bot_configs")
        .upsert({
        user_id: user.id,
        ...config,
    });
    if (error)
        return res.status(400).json({ error: error.message });
    res.json({ message: "Bot settings saved" });
};
//# sourceMappingURL=bot.controller.js.map