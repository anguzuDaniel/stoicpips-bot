const axiosClient = require('axios');
const { logAdminAction: auditLogger } = require('../../utils/auditLog');
const { botStates } = require('../../types/botStates');

/**
 * POST /api/v1/admin/bot/pause
 * Trigger "Great Pause" - Emergency stop for all automated trading
 */
exports.triggerGreatPause = async (req, res) => {
    try {
        const { reason = 'Admin initiated emergency pause' } = req.body;

        // Set global pause flag in bot state
        botStates.globalPause = true;
        botStates.pauseReason = reason;
        botStates.pausedAt = new Date().toISOString();
        botStates.pausedBy = req.user.email;

        // Send signal to AI Engine to halt trading
        const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        let aiEngineResponse = null;

        try {
            aiEngineResponse = await axiosClient.post(`${aiEngineUrl}/admin/pause`, {
                reason,
                admin_id: req.user.id
            }, { timeout: 5000 });
        } catch (error) {
            console.error('[GREAT PAUSE] Failed to notify AI Engine:', error.message);
            // Continue even if AI engine is unreachable
        }

        // Count affected bots (users with active trading)
        // For now, we'll just return a placeholder count
        const affectedBots = 0; // TODO: Query active trading sessions

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
            paused_at: botStates.pausedAt,
            paused_by: botStates.pausedBy,
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
exports.resumeTrading = async (req, res) => {
    try {
        // Clear global pause flag
        botStates.globalPause = false;
        botStates.pauseReason = null;
        botStates.resumedAt = new Date().toISOString();
        botStates.resumedBy = req.user.email;

        // Notify AI Engine
        const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        try {
            await axiosClient.post(`${aiEngineUrl}/admin/resume`, {
                admin_id: req.user.id
            }, { timeout: 5000 });
        } catch (error) {
            console.error('[RESUME] Failed to notify AI Engine:', error.message);
        }

        await auditLogger(req.user.id, 'RESUME_TRADING');

        console.info(`[TRADING RESUMED] By: ${req.user.email}`);

        res.json({
            message: 'Trading resumed successfully',
            status: 'active',
            resumed_at: botStates.resumedAt,
            resumed_by: botStates.resumedBy
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
exports.getGlobalBotStatus = async (req, res) => {
    try {
        res.json({
            is_paused: botStates.globalPause || false,
            pause_reason: botStates.pauseReason,
            paused_at: botStates.pausedAt,
            paused_by: botStates.pausedBy,
            resumed_at: botStates.resumedAt,
            resumed_by: botStates.resumedBy
        });
    } catch (error) {
        console.error('[ADMIN] Get global bot status error:', error);
        res.status(500).json({ error: 'Failed to get bot status' });
    }
};

export {};
