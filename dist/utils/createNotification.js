"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Creates a persistent notification for a user.
 * @param userId - The ID of the user to notify.
 * @param title - The short title of the notification.
 * @param message - The detailed message body.
 * @param type - The type of notification ('info', 'success', 'warning', 'error', 'alert').
 */
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        const { error } = await supabase_1.supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            is_read: false
        });
        if (error) {
            console.error(`[Notification] Failed to create notification for ${userId}:`, error.message);
        }
        else {
            //   console.log(`[Notification] Created for ${userId}: ${title}`);
        }
    }
    catch (err) {
        console.error(`[Notification] Unexpected error:`, err.message);
    }
};
exports.createNotification = createNotification;
