import axios from 'axios';
import { logAdminAction as auditLogger } from '../../utils/auditLog';
import { botStates } from '../../types/botStates';

/**
 * POST /api/v1/admin/bot/pause
 * Trigger "Great Pause" - Emergency stop for all automated trading
 */
export const triggerGreatPause = async (req: any, res: any) => {
    try {
        const { reason = 'Admin initiated emergency pause' } = req.body;

        // Set global pause flag in bot state
        (botStates as any).globalPause = true;
        (botStates as any).pauseReason = reason;
        (botStates as any).pausedAt = new Date().toISOString();
        (botStates as any).pausedBy = req.user.email;

        // Send signal to AI Engine to halt trading
        const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        let aiEngineResponse = null;

        try {
            aiEngineResponse = await axios.post(`${aiEngineUrl}/admin/pause`, {
                reason,
                admin_id: req.user.id
            }, { timeout: 5000 });
        } catch (error: any) {
            console.error('[GREAT PAUSE] Failed to notify AI Engine:', error.message);
        }

        const affectedBots = 0;

        await auditLogger(req.user.id, 'TRIGGER_GREAT_PAUSE', null, {
            reason,
            ai_engine_notified: !!aiEngineResponse,
            affected_bots: affectedBots
        });

        console.warn(`[GREAT PAUSE ACTIVATED] By: ${req.user.email}, Reason: ${reason}`);

        res.json({
            message: 'Great Pause activated successfully',
            status: 'paused',
            reason,
            paused_at: (botStates as any).pausedAt,
            paused_by: (botStates as any).pausedBy,
            affected_bots: affectedBots,
            ai_engine_notified: !!aiEngineResponse
        });
    } catch (error) {
        console.error('[ADMIN] Great Pause error:', error);
        res.status(500).json({ error: 'Failed to trigger Great Pause' });
    }
};

/**
 * POST /api/v1/admin/bot/resume
 * Resume automated trading after Great Pause
 */
export const resumeTrading = async (req: any, res: any) => {
    try {
        (botStates as any).globalPause = false;
        (botStates as any).pauseReason = null;
        (botStates as any).resumedAt = new Date().toISOString();
        (botStates as any).resumedBy = req.user.email;

        const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        try {
            await axios.post(`${aiEngineUrl}/admin/resume`, {
                admin_id: req.user.id
            }, { timeout: 5000 });
        } catch (error: any) {
            console.error('[RESUME] Failed to notify AI Engine:', error.message);
        }

        await auditLogger(req.user.id, 'RESUME_TRADING');

        console.info(`[TRADING RESUMED] By: ${req.user.email}`);

        res.json({
            message: 'Trading resumed successfully',
            status: 'active',
            resumed_at: (botStates as any).resumedAt,
            resumed_by: (botStates as any).resumedBy
        });
    } catch (error) {
        console.error('[ADMIN] Resume trading error:', error);
        res.status(500).json({ error: 'Failed to resume trading' });
    }
};

/**
 * GET /api/v1/admin/bot/status
 * Get current global bot status
 */
export const getGlobalBotStatus = async (req: any, res: any) => {
    try {
        res.json({
            is_paused: (botStates as any).globalPause || false,
            pause_reason: (botStates as any).pauseReason,
            paused_at: (botStates as any).pausedAt,
            paused_by: (botStates as any).pausedBy,
            resumed_at: (botStates as any).resumedAt,
            resumed_by: (botStates as any).resumedBy
        });
    } catch (error) {
        console.error('[ADMIN] Get global bot status error:', error);
        res.status(500).json({ error: 'Failed to get bot status' });
    }
};
