import { supabase } from '../../../config/supabase';
import { botStates } from '../../../types/botStates';

export const getBotStatus = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const botState = botStates.get(userId);

    const { data: status } = await supabase
      .from("bot_status")
      .select("*")
      .eq("user_id", userId)
      .single();

    res.json({
      isRunning: botState ? botState.isRunning : false,
      startedAt: botState ? botState.startedAt : null,
      tradesExecuted: botState ? botState.tradesExecuted : 0,
      totalProfit: botState ? botState.totalProfit : 0,
      statusFromDb: status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};