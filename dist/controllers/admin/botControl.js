"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalBotStatus = exports.resumeTrading = exports.triggerGreatPause = void 0;
const axios_1 = __importDefault(require("axios"));
const auditLog_1 = require("../../utils/auditLog");
const botStates_1 = require("../../types/botStates");
/**
 * POST /api/v1/admin/bot/pause
 * Trigger "Great Pause" - Emergency stop for all automated trading
 */
const triggerGreatPause = async (req, res) => {
    try {
        const { reason = 'Admin initiated emergency pause' } = req.body;
        // Set global pause flag in bot state
        botStates_1.botStates.globalPause = true;
        botStates_1.botStates.pauseReason = reason;
        botStates_1.botStates.pausedAt = new Date().toISOString();
        botStates_1.botStates.pausedBy = req.user.email;
        // Send signal to AI Engine to halt trading
        const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        let aiEngineResponse = null;
        try {
            aiEngineResponse = await axios_1.default.post(`${aiEngineUrl}/admin/pause`, {
                reason,
                admin_id: req.user.id
            }, { timeout: 5000 });
        }
        catch (error) {
            console.error('[GREAT PAUSE] Failed to notify AI Engine:', error.message);
        }
        const affectedBots = 0;
        await (0, auditLog_1.logAdminAction)(req.user.id, 'TRIGGER_GREAT_PAUSE', null, {
            reason,
            ai_engine_notified: !!aiEngineResponse,
            affected_bots: affectedBots
        });
        console.warn(`[GREAT PAUSE ACTIVATED] By: ${req.user.email}, Reason: ${reason}`);
        res.json({
            message: 'Great Pause activated successfully',
            status: 'paused',
            reason,
            paused_at: botStates_1.botStates.pausedAt,
            paused_by: botStates_1.botStates.pausedBy,
            affected_bots: affectedBots,
            ai_engine_notified: !!aiEngineResponse
        });
    }
    catch (error) {
        console.error('[ADMIN] Great Pause error:', error);
        res.status(500).json({ error: 'Failed to trigger Great Pause' });
    }
};
exports.triggerGreatPause = triggerGreatPause;
/**
 * POST /api/v1/admin/bot/resume
 * Resume automated trading after Great Pause
 */
const resumeTrading = async (req, res) => {
    try {
        botStates_1.botStates.globalPause = false;
        botStates_1.botStates.pauseReason = null;
        botStates_1.botStates.resumedAt = new Date().toISOString();
        botStates_1.botStates.resumedBy = req.user.email;
        const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        try {
            await axios_1.default.post(`${aiEngineUrl}/admin/resume`, {
                admin_id: req.user.id
            }, { timeout: 5000 });
        }
        catch (error) {
            console.error('[RESUME] Failed to notify AI Engine:', error.message);
        }
        await (0, auditLog_1.logAdminAction)(req.user.id, 'RESUME_TRADING');
        console.info(`[TRADING RESUMED] By: ${req.user.email}`);
        res.json({
            message: 'Trading resumed successfully',
            status: 'active',
            resumed_at: botStates_1.botStates.resumedAt,
            resumed_by: botStates_1.botStates.resumedBy
        });
    }
    catch (error) {
        console.error('[ADMIN] Resume trading error:', error);
        res.status(500).json({ error: 'Failed to resume trading' });
    }
};
exports.resumeTrading = resumeTrading;
/**
 * GET /api/v1/admin/bot/status
 * Get current global bot status
 */
const getGlobalBotStatus = async (req, res) => {
    try {
        res.json({
            is_paused: botStates_1.botStates.globalPause || false,
            pause_reason: botStates_1.botStates.pauseReason,
            paused_at: botStates_1.botStates.pausedAt,
            paused_by: botStates_1.botStates.pausedBy,
            resumed_at: botStates_1.botStates.resumedAt,
            resumed_by: botStates_1.botStates.resumedBy
        });
    }
    catch (error) {
        console.error('[ADMIN] Get global bot status error:', error);
        res.status(500).json({ error: 'Failed to get bot status' });
    }
};
exports.getGlobalBotStatus = getGlobalBotStatus;
