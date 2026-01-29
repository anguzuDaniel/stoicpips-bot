const supabase = require('../../config/supabase').supabase;

/**
 * Log admin actions for audit trail
 */
exports.logAdminAction = async (adminId, actionType, targetUserId = null, details = {}) => {
    try {
        const { error } = await supabase
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
    } catch (err) {
        console.error('[AUDIT LOG EXCEPTION]', err);
    }
};

export {};
