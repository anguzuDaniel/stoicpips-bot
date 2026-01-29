"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAdminAction = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Log admin actions for audit trail
 */
const logAdminAction = async (adminId, actionType, targetUserId = null, details = {}) => {
    try {
        const { error } = await supabase_1.supabase
            .from('admin_audit_log')
            .insert({
            admin_id: adminId,
            action_type: actionType,
            target_user_id: targetUserId,
            details: details,
            timestamp: new Date().toISOString()
        });
        if (error) {
            console.error('[AUDIT LOG ERROR]', error);
        }
    }
    catch (err) {
        console.error('[AUDIT LOG EXCEPTION]', err);
    }
};
exports.logAdminAction = logAdminAction;
