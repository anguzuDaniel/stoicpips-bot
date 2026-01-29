"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requirePaidUser = exports.authenticateToken = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Enhanced authentication middleware that fetches the latest user profile from the database.
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const { data: { user }, error: authError } = await supabase_1.supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        // Always fetch the latest profile from DB as the source of truth
        const { data: profile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select('subscription_status, subscription_tier, is_admin')
            .eq('id', user.id)
            .single();
        if (profileError && profileError.code !== 'PGRST116') {
            console.error(`❌ [${user.id}] Middleware Profile Fetch Error:`, profileError.message);
        }
        req.user = {
            id: user.id,
            email: user.email,
            subscription_status: profile?.subscription_status || 'free',
            subscription_tier: profile?.subscription_tier || 'free',
            isAdmin: profile?.is_admin || false
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requirePaidUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const hasPaidSubscription = req.user.subscription_status === 'active' ||
        req.user.subscription_status === 'premium' ||
        req.user.subscription_tier === 'pro' ||
        req.user.subscription_tier === 'elite';
    if (!hasPaidSubscription) {
        return res.status(403).json({ error: 'Paid subscription required' });
    }
    next();
};
exports.requirePaidUser = requirePaidUser;
const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
