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

        // 1. Always update the Database Config first
        // We need to fetch the config to know which tokens to verify/use
        const { data: dbConfig, error } = await supabase
            .from('bot_configs')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !dbConfig) {
            console.error("Failed to fetch fresh config for toggle:", error);
            return res.status(400).json({ error: "Failed to load configuration. Please save settings first." });
        }

        const config = { ...dbConfig, ...dbConfig.config_data };
        const sanitizeToken = (t: string) => t ? t.trim().replace(/[\[\]"]/g, '') : '';

        let newToken = '';
        if (targetType === 'real') {
            newToken = sanitizeToken(config.deriv_real_token || config.derivRealToken);
            if (!newToken) return res.status(400).json({ error: "Real account token not configured. Please add it in Settings." });
        } else {
            newToken = sanitizeToken(config.deriv_demo_token || config.derivDemoToken || config.deriv_api_token || config.derivApiToken);
            if (!newToken) return res.status(400).json({ error: "Demo account token not configured." });
        }

        console.log(`🔄 Toggling to ${targetType} account for user ${userId}`);

        // 2. Persist the preference to DB so it sticks on restart
        // Storing it in config_data
        const updatedConfigData = { ...dbConfig.config_data, activeAccountType: targetType };
        await supabase
            .from('bot_configs')
            .update({ config_data: updatedConfigData })
            .eq('user_id', userId);


        // 3. If Bot is running, update the live session
        const botState = botStates.get(userId);
        if (botState) {
            // ... existing live switch logic ...
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
                        error: "Compliance Error: The token provided for Real Account is actually a Demo token. Please check Settings."
                    });
                }
                if (targetType === 'demo' && authResult.accountType === 'real') {
                    newWS.disconnect();
                    return res.status(400).json({
                        error: "Compliance Error: The token provided for Demo Account is actually a Real token."
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
                console.error("❌ Authorization failed during live toggle:", authErr.message);
                newWS.disconnect();
                return res.status(401).json({ error: `Failed to switch active session: ${authErr.message}` });
            }
        } else {
            // Bot is offline, just return success since we updated DB
            return res.json({
                success: true,
                message: `Account preference set to ${targetType}. Will use this when bot starts.`,
                accountType: targetType
            });
        }

    } catch (error: any) {
        console.error('Toggle account error:', error);
        res.status(500).json({ error: 'Failed to toggle account' });
    }
};
