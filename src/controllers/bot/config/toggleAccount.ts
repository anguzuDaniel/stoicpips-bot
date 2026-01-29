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

        // Retrieve tokens from config (assuming they are in botState.config or we fetch from DB)
        // Ideally botState.config should have them if we loaded them on start
        const config = botState.config;

        if (!config) {
            return res.status(400).json({ error: "Configuration not loaded." });
        }

        let newToken = '';
        if (targetType === 'real') {
            newToken = config.derivRealToken;
            if (!newToken) return res.status(400).json({ error: "Real account token not configured." });
        } else {
            newToken = config.derivDemoToken || config.derivApiToken; // Fallback to main token if specific demo not set
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
        const appId = process.env.DERIV_APP_ID || "62019"; // Default fallback

        const newWS = new DerivWebSocket({
            apiToken: newToken,
            appId: appId
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
