import { Response } from 'express';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import { botStates } from '../../../types/botStates';
import { DerivWebSocket } from '../../../deriv/DerivWebSocket';
import { supabase } from '../../../config/supabase';
import { BotLogger } from '../../../utils/botLogger';

/**
 * Toggles between Real and Demo accounts for the user's bot session.
 */
export const toggleAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { targetType } = req.body; // 'real' or 'demo'

        const botState = botStates.get(userId);

        if (!botState) {
            return res.status(404).json({ error: "Bot session not active. Please start the bot first." });
        }

        const { data: dbConfig, error } = await supabase
            .from('bot_configs')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !dbConfig) {
            console.error("Failed to fetch fresh config for toggle:", error);
            return res.status(400).json({ error: "Failed to load latest configuration." });
        }

        botState.config = { ...botState.config, ...dbConfig };
        const config = botState.config;

        const sanitizeToken = (t: string) => t ? t.trim().replace(/[\[\]"]/g, '') : '';

        let newToken = '';
        if (targetType === 'real') {
            newToken = sanitizeToken(config.deriv_real_token || config.derivRealToken);
            if (!newToken) return res.status(400).json({ error: "Real account token not configured." });
        } else {
            newToken = sanitizeToken(config.deriv_demo_token || config.derivDemoToken || config.deriv_api_token || config.derivApiToken);
            if (!newToken) return res.status(400).json({ error: "Demo account token not configured." });
        }

        console.log(`🔄 Toggling to ${targetType} account for user ${userId}`);

        if (botState.derivWS) {
            botState.derivWS.disconnect();
            botState.derivWS = null;
        }

        const appId = process.env.DERIV_APP_ID || "1089";

        const newWS = new DerivWebSocket({
            apiToken: newToken,
            appId: appId
        });

        newWS.on('log', (logData: any) => {
            BotLogger.log(userId, logData.message, logData.type);
        });

        const authPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                newWS.off('authorized', authHandler);
                reject(new Error("Authorization timed out"));
            }, 10000);

            const authHandler = (authData: any) => {
                clearTimeout(timeout);
                if (authData.success) {
                    resolve(authData);
                } else {
                    reject(new Error(authData.error || "Authorization failed"));
                }
            };
            newWS.once('authorized', authHandler);
        });

        newWS.connect();

        try {
            const authResult: any = await authPromise;

            if (targetType === 'real' && authResult.accountType === 'demo') {
                newWS.disconnect();
                return res.status(400).json({
                    error: "Compliance Error: The token provided for Real Account is actually a Demo token (starts with V). Please update your Real Account Token in Settings."
                });
            }
            if (targetType === 'demo' && authResult.accountType === 'real') {
                newWS.disconnect();
                return res.status(400).json({
                    error: "Compliance Error: The token provided for Demo Account is actually a Real Account token. Please use a Virtual (Demo) token."
                });
            }

            botState.derivWS = newWS;
            botState.derivConnected = true;
            botState.config.activeAccountType = authResult.accountType;

            return res.json({
                success: true,
                message: `Switched to ${targetType} account`,
                accountType: authResult.accountType,
                loginId: authResult.loginId
            });
        } catch (authErr: any) {
            console.error("❌ Authorization failed during toggle:", authErr.message);
            newWS.disconnect();
            return res.status(401).json({
                error: `Failed to switch to ${targetType} account: ${authErr.message}`
            });
        }

    } catch (error: any) {
        console.error('Toggle account error:', error);
        res.status(500).json({ error: 'Failed to toggle account' });
    }
};
