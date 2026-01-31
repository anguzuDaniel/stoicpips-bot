import { supabase } from '../../../config/supabase';

export const saveBotConfig = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const {
      symbols,
      amountPerTrade,
      timeframe,
      candleCount,
      cycleInterval,
      contractPreference,
      maxTradesPerCycle,
      dailyTradeLimit,
      derivApiToken,
      derivRealToken,
      derivDemoToken,
      openaiApiKey,
      aiProvider
    } = req.body;

    const dbConfig = {
      user_id: userId,
      symbols,
      amount_per_trade: amountPerTrade,
      timeframe,
      candle_count: candleCount,
      cycle_interval: cycleInterval,
      contract_preference: contractPreference,
      max_trades_per_cycle: maxTradesPerCycle,
      daily_trade_limit: dailyTradeLimit,
      deriv_api_token: derivApiToken,
      deriv_real_token: derivRealToken,
      deriv_demo_token: derivDemoToken,
      openai_api_key: openaiApiKey,
      ai_provider: aiProvider,
      updated_at: new Date()
    };

    // --- Enforce Subscription Limits ---
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const tier = profile?.subscription_tier; // 'pro' | 'elite' | null/free

    // Limit Definitions
    let maxDailyTradesLimit = 5;
    let maxSymbolsLimit = 5;

    if (tier === 'elite') {
      maxDailyTradesLimit = 10000; // Unlimited effectively
      maxSymbolsLimit = 100;       // Unlimited effectively
    } else if (tier === 'pro') {
      maxDailyTradesLimit = 20;
      maxSymbolsLimit = 10;
    }

    // Validate Daily Trades
    if (dailyTradeLimit > maxDailyTradesLimit) {
      return res.status(403).json({
        error: `Plan Limit Exceeded: Your ${tier || 'Free'} plan allows max ${maxDailyTradesLimit} daily trades. Please upgrade.`
      });
    }

    // Validate Symbols Count
    if (symbols && symbols.length > maxSymbolsLimit) {
      return res.status(403).json({
        error: `Plan Limit Exceeded: Your ${tier || 'Free'} plan allows max ${maxSymbolsLimit} active symbols. Please upgrade.`
      });
    }

    const { data, error } = await supabase
      .from("bot_configs")
      .upsert(dbConfig, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
