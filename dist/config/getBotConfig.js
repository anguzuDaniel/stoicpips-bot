import { supabase } from "./supabase.js";
export const getBotConfig = async (req, res) => {
    const user = req.user;
    const { data, error } = await supabase
        .from("bot_configs")
        .select("*")
        .eq("user_id", user.id)
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
};
//# sourceMappingURL=getBotConfig.js.map