import { supabase } from '../../../config/supabase';
import { botStates } from '../../../types/botStates';
import { DerivWebSocket } from '../../../deriv/DerivWebSocket';

export const getBotStatus = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const botState = botStates.get(userId);

    // 1. Get Balance from active connection if available
    let derivAccount = null;

    // Check active state
    if (botState && botState.derivWS && botState.derivWS.getStatus().connected) {
      const wsStatus = botState.derivWS.getStatus();
      derivAccount = {
        balance: wsStatus.balance,
        currency: wsStatus.currency,
        accountType: wsStatus.accountType || (botState.config?.deriv_demo_token ? 'demo' : 'real')
      };
    }
    // Passive Mode: If not running/connected, try to connect briefly to get status
    else {
      // Logic: If user has config, try to connect passively
      // We can check if we have a config in DB
      const { data: botConfig } = await supabase.from("bot_configs").select("*").eq("user_id", userId).single();

      if (botConfig) {
        const config = { ...botConfig, ...botConfig.config_data };
        const token = config.deriv_demo_token || config.derivDemoToken || config.deriv_real_token || config.derivRealToken;

        if (token) {
          const passiveWS = new DerivWebSocket({
            apiToken: token,
            appId: process.env.DERIV_APP_ID || '1089',
            reconnect: false
          });

          // Helper to connect and get balance with timeout
          try {
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => reject('Timeout'), 5000);
              passiveWS.once('authorized', (auth: any) => {
                clearTimeout(timeout);
                if (auth.success) resolve(); else reject('Auth Failed');
              });
              passiveWS.connect();
            });

            const status = passiveWS.getStatus();
            derivAccount = {
              balance: status.balance,
              currency: status.currency,
              accountType: status.accountType
            };
            passiveWS.disconnect();
          } catch (e) {
            // console.log('Passive connection failed:', e);
            // Expected if token invalid or timeout
            if (passiveWS) passiveWS.disconnect();
          }
        }
      }
    }

    // 2. Fetch DB status (with simple TTL cache to prevent spamming DB)
    // We can attach a cache to the botState or use a global LRU. For simplicity, we'll check lastSyncTime in botState
    let status = null;
    const CACHE_TTL = 5000; // 5 seconds
    const now = Date.now();

    if (botState && botState.lastSyncTime && (now - botState.lastSyncTime < CACHE_TTL) && botState.cachedDbStatus) {
      status = botState.cachedDbStatus;
    } else {
      const { data: dbStatus } = await supabase
        .from("bot_status")
        .select("*")
        .eq("user_id", userId)
        .single();
      status = dbStatus;

      // Update cache if we have a state object to hold it
      if (botState) {
        botState.lastSyncTime = now;
        botState.cachedDbStatus = status;
      }
    }

    let tier = botState?.subscriptionTier;
    if (!tier) {
      // Optimization: If we have a botState but no tier, maybe we can skip fetching if we fetched recently?
      // For now, let's just fetch but maybe we can store it in a static map if needed? 
      // Actually, let's trust the profile fetch for now but cache it in botState if possible.
      const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', userId).single();
      tier = profile?.subscription_tier || 'free';
      if (botState) botState.subscriptionTier = tier;
    }

    res.json({
      isRunning: botState ? botState.isRunning : false,
      startedAt: botState ? botState.startedAt : null,
      tradesExecuted: botState ? botState.tradesExecuted : 0,
      totalProfit: botState ? botState.totalProfit : 0,
      subscriptionTier: tier,
      derivAccount, // <--- Added this
      statusFromDb: status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};