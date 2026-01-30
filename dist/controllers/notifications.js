"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Get user's notifications
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[DEBUG] Fetching notifications for user: ${userId}`);
        const { data, error } = await supabase_1.supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50); // Fetch last 50
        if (error)
            throw error;
        console.log(`[DEBUG] Found ${data ? data.length : 0} notifications for user ${userId}`);
        res.json({ notifications: data });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};
exports.getNotifications = getNotifications;
/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { error } = await supabase_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId);
        if (error)
            throw error;
        res.json({ message: "Notification marked as read" });
    }
    catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
};
exports.markAsRead = markAsRead;
/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { error } = await supabase_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        if (error)
            throw error;
        res.json({ message: "All notifications marked as read" });
    }
    catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ error: "Failed to update notifications" });
    }
};
exports.markAllAsRead = markAllAsRead;
