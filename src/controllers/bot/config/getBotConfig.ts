import { supabase } from '../../../config/supabase';

export const getBotConfig = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || {});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
