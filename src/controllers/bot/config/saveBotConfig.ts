import { supabase } from '../../../config/supabase';

export const saveBotConfig = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const config = req.body;

    const { data, error } = await supabase
      .from("bot_configs")
      .upsert({ user_id: userId, ...config, updated_at: new Date() })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
