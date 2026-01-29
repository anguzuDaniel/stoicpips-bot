import { Response } from 'express';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
const botStates = require('../../../types/botStates');
import { DerivWebSocket } from '../../../deriv/DerivWebSocket';

/**
 * Toggles between Real and Demo accounts for the user's bot session.
 * Re-initializes the DerivWebSocket with the appropriate token.
 */
export const toggleAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { targetType } = req.body; // 'real' or 'demo'

        const botState = botStates.get(userId);

        if (!botState) {
            return res.status(404).json({ error: "Bot session not active. Please start the bot first." });
        }

        // Fetch latest config from DB to ensure tokens are up-to-date
        const supabase = require('../../../config/supabase').supabase;
        const { data: dbConfig, error } = await supabase
            .from('bot_configs')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !dbConfig) {
            console.error("Failed to fetch fresh config for toggle:", error);
            return res.status(400).json({ error: "Failed to load latest configuration." });
        }

        // Update in-memory config with fresh DB data
        // We merge it to preserve any runtime properties if necessary, but tokens must come from DB
        botState.config = { ...botState.config, ...dbConfig };
        const config = botState.config;


        let newToken = '';
        if (targetType === 'real') {
            newToken = config.deriv_real_token || config.derivRealToken;
            if (!newToken) return res.status(400).json({ error: "Real account token not configured." });
        } else {
            // Fallback chain: Demo Token -> Legacy DB Token -> Legacy Config Token
            newToken = config.deriv_demo_token || config.derivDemoToken || config.deriv_api_token || config.derivApiToken;
            if (!newToken) return res.status(400).json({ error: "Demo account token not configured." });
        }

        console.log(`🔄 Toggling to ${targetType} account for user ${userId}`);

        // Disconnect existing WS
        if (botState.derivWS) {
            botState.derivWS.disconnect();
            botState.derivWS = null;
        }

        // Reconnect with new token
        // CAUTION: This assumes DerivWebSocket constructor just needs options. 
        // We might need to ensure other options like appId are preserved.
        const appId = process.env.DERIV_APP_ID || "1089"; // Standard App ID

        const newWS = new DerivWebSocket({
            apiToken: newToken,
            appId: appId
        });

        // Wire up logs (CRITICAL for frontend visibility)
        const { BotLogger } = require('../../../utils/botLogger');
        newWS.on('log', (logData: any) => {
            BotLogger.log(userId, logData.message, logData.type);
        });

        newWS.connect();

        // Update state
        botState.derivWS = newWS;
        botState.derivConnected = true;

        // Update active token in config purely in memory for this session
        // so if we restart, it might revert unless we persist 'lastActiveAccount' pref
        // For now, in-memory switch is sufficient for the session.

        return res.json({
            success: true,
            message: `Switched to ${targetType} account`,
            accountType: targetType
        });

    } catch (error: any) {
        console.error('Toggle account error:', error);
        res.status(500).json({ error: 'Failed to toggle account' });
    }
};
