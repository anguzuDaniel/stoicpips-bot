"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnouncements = exports.createAnnouncement = void 0;
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
