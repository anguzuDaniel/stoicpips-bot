"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnouncement = exports.getAllAnnouncements = exports.getAnnouncements = exports.createAnnouncement = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Creates a global announcement (Admin only)
 */
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, expires_at } = req.body;
        if (!title || !message) {
            return res.status(400).json({ error: "Title and message are required" });
        }
        const { data, error } = await supabase_1.supabase
            .from('admin_announcements')
            .insert([{
                title,
                message,
                type: type || 'info',
                expires_at: expires_at || null,
                created_at: new Date().toISOString()
            }])
            .select();
        if (error)
            throw error;
        // Broadcast Notification to ALL Users
        try {
            const { data: users, error: userError } = await supabase_1.supabase
                .from('profiles')
                .select('id');
            if (!userError && users) {
                const notifications = users.map(user => ({
                    user_id: user.id,
                    type: type || 'info',
                    title: `New Announcement: ${title}`,
                    message: message.substring(0, 100) + (message.length > 100 ? '...' : ''), // Truncate for notification
                    is_read: false
                }));
                await supabase_1.supabase.from('notifications').insert(notifications);
            }
        }
        catch (notifWarn) {
            console.warn("Failed to broadcast announcement notification:", notifWarn);
            // Don't fail the request, just log warning
        }
        if (error)
            throw error;
        res.status(201).json({ message: "Announcement created successfully", data: data[0] });
    }
    catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ error: "Failed to create announcement" });
    }
};
exports.createAnnouncement = createAnnouncement;
/**
 * Fetches active announcements
 */
const getAnnouncements = async (req, res) => {
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase_1.supabase
            .from('admin_announcements')
            .select('*')
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({ announcements: data });
    }
    catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ error: "Failed to fetch announcements" });
    }
};
exports.getAnnouncements = getAnnouncements;
/**
 * Fetches ALL announcements (Admin History)
 */
const getAllAnnouncements = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('admin_announcements')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({ announcements: data });
    }
    catch (error) {
        console.error("Error fetching all announcements:", error);
        res.status(500).json({ error: "Failed to fetch announcements" });
    }
};
exports.getAllAnnouncements = getAllAnnouncements;
/**
 * Delete an announcement
 */
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('admin_announcements')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: "Announcement deleted" });
    }
    catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ error: "Failed to delete announcement" });
    }
};
exports.deleteAnnouncement = deleteAnnouncement;
