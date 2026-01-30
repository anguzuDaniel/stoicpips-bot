import { supabase } from '../config/supabase';

/**
 * Creates a persistent notification for a user.
 * @param userId - The ID of the user to notify.
 * @param title - The short title of the notification.
 * @param message - The detailed message body.
 * @param type - The type of notification ('info', 'success', 'warning', 'error', 'alert').
 */
export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'alert' = 'info'
) => {
    try {
        const { error } = await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            is_read: false
        });

        if (error) {
            console.error(`[Notification] Failed to create notification for ${userId}:`, error.message);
        } else {
            //   console.log(`[Notification] Created for ${userId}: ${title}`);
        }
    } catch (err: any) {
        console.error(`[Notification] Unexpected error:`, err.message);
    }
};
