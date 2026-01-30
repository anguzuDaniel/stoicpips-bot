import { Response } from 'express';
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { supabase } from '../config/supabase';

/**
 * Get user's notifications
 */
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50); // Fetch last 50

        if (error) throw error;

        res.json({ notifications: data });
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ message: "Notification marked as read" });
    } catch (error: any) {
        console.error("Error updating notification:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;

        res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
        console.error("Error marking all read:", error);
        res.status(500).json({ error: "Failed to update notifications" });
    }
};
