"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalAnalytics = void 0;
const supabase_1 = require("../../config/supabase");
const auditLog_1 = require("../../utils/auditLog");
/**
 * GET /api/v1/admin/analytics/global
 * Get platform-wide trading analytics
 */
const getGlobalAnalytics = async (req, res) => {
    try {
        const { data: allTrades, error: tradesError } = await supabase_1.supabase
            .from('trades')
            .select('status, pnl, user_id, created_at');
        if (tradesError) {
            console.error('[ADMIN] Failed to fetch trades:', tradesError);
            return res.status(500).json({ error: 'Failed to fetch analytics' });
        }
        const totalTrades = allTrades.length;
        const wonTrades = allTrades.filter(t => t.status === 'won').length;
        const lostTrades = allTrades.filter(t => t.status === 'lost').length;
        const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(2) : "0.00";
        const totalPnL = allTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const activeUsers = new Set(allTrades.map(t => t.user_id)).size;
        const { data: users, error: usersError } = await supabase_1.supabase
            .from('profiles')
            .select('id, subscription_tier');
        if (usersError) {
            console.error('[ADMIN] Failed to fetch users:', usersError);
        }
        const tierMetrics = {};
        if (users) {
            const userTierMap = {};
            users.forEach(u => {
                userTierMap[u.id] = u.subscription_tier || 'free';
            });
            ['free', 'pro', 'elite'].forEach(tier => {
                const tierTrades = allTrades.filter(t => userTierMap[t.user_id] === tier);
                const tierWins = tierTrades.filter(t => t.status === 'won').length;
                const tierTotal = tierTrades.length;
                const tierPnL = tierTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                tierMetrics[tier] = {
                    total_trades: tierTotal,
                    win_rate: tierTotal > 0 ? ((tierWins / tierTotal) * 100).toFixed(2) : 0,
                    total_pnl: tierPnL.toFixed(2),
                    active_users: new Set(tierTrades.map(t => t.user_id)).size
                };
            });
        }
        const avgAiConfidence = 85;
        await (0, auditLog_1.logAdminAction)(req.user.id, 'VIEW_GLOBAL_ANALYTICS');
        res.json({
            timestamp: new Date().toISOString(),
            global_metrics: {
                total_trades: totalTrades,
                won_trades: wonTrades,
                lost_trades: lostTrades,
                win_rate: parseFloat(winRate),
                total_pnl: totalPnL.toFixed(2),
                active_users: activeUsers,
                avg_ai_confidence: avgAiConfidence
            },
            tier_breakdown: tierMetrics
        });
    }
    catch (error) {
        console.error('[ADMIN] Global analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch global analytics' });
    }
};
exports.getGlobalAnalytics = getGlobalAnalytics;
