"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserTier = exports.listUsers = void 0;
const supabase_1 = require("../../config/supabase");
const { logAdminAction } = require('../../utils/auditLog');
const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        const offset = (page - 1) * limit;
        let query = supabase_1.supabase
            .from('profiles')
            .select('id, email, subscription_tier, last_active, created_at, is_admin', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        // Apply search filter if provided
        if (search) {
            query = query.ilike('email', `%${search}%`);
        }
        const { data: users, error, count } = await query;
        if (error) {
            console.error('[ADMIN] Failed to fetch users:', error);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        // Fetch total trades for each user
        const userIds = users.map(u => u.id);
        const { data: tradeCounts } = await supabase_1.supabase
            .from('trades')
            .select('user_id')
            .in('user_id', userIds);
        // Count trades per user
        const tradeCountMap = {};
        if (tradeCounts) {
            tradeCounts.forEach(trade => {
                tradeCountMap[trade.user_id] = (tradeCountMap[trade.user_id] || 0) + 1;
            });
        }
        // Enrich user data with trade counts
        const enrichedUsers = users.map(user => ({
            ...user,
            total_trades: tradeCountMap[user.id] || 0
        }));
        await logAdminAction(req.user.id, 'LIST_USERS', null, { search, page, limit });
        res.json({
            users: enrichedUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    }
    catch (error) {
        console.error('[ADMIN] List users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.listUsers = listUsers;
/**
 * PATCH /api/v1/admin/users/:id/tier
 * Update user subscription tier
 */
const updateUserTier = async (req, res) => {
    try {
        const { id } = req.params;
        const { tier } = req.body;
        // Validate tier
        const validTiers = ['free', 'pro', 'elite'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier. Must be: free, pro, or elite' });
        }
        // Update user tier
        const { data, error } = await supabase_1.supabase
            .from('profiles')
            .update({ subscription_tier: tier })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('[ADMIN] Failed to update user tier:', error);
            return res.status(500).json({ error: 'Failed to update user tier' });
        }
        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }
        await logAdminAction(req.user.id, 'UPDATE_USER_TIER', id, { old_tier: data.subscription_tier, new_tier: tier });
        res.json({
            message: 'User tier updated successfully',
            user: data
        });
    }
    catch (error) {
        console.error('[ADMIN] Update tier error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUserTier = updateUserTier;
