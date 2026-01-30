"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBugReportStatus = exports.getBugReports = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Fetch all bug reports
 */
const getBugReports = async (req, res) => {
    try {
        // Removed .select('*, users(email, full_name)') because public.users table does not exist
        // and we cannot easily join auth.users via public API without a view/wrapper.
        // For now, we will just fetch the bug reports. 
        // Ideally we would fetch user emails separately using the admin API if needed.
        // Join with profiles failed due to missing FK.
        // Reverting to simple fetch to fix 500 error.
        const { data, error } = await supabase_1.supabase
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({ reports: data });
    }
    catch (error) {
        console.error("Error fetching bug reports:", error);
        res.status(500).json({ error: "Failed to fetch bug reports" });
    }
};
exports.getBugReports = getBugReports;
/**
 * Update bug report status
 */
const updateBugReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const { data, error } = await supabase_1.supabase
            .from('bug_reports')
            .update({ status })
            .eq('id', id)
            .select();
        if (error)
            throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Bug report not found" });
        }
        // Send Notification if resolved/closed
        if (status === 'resolved' || status === 'closed') {
            const report = data[0];
            const title = `Bug Report ${status === 'resolved' ? 'Resolved' : 'Closed'}`;
            const message = `Your bug report "${report.title}" has been marked as ${status}. Thank you for your feedback!`;
            try {
                // Fetch ALL users to notify everyone
                const { data: users, error: userError } = await supabase_1.supabase
                    .from('profiles')
                    .select('id');
                if (userError || !users) {
                    console.error("Failed to fetch users for broadcast:", userError);
                    // Fallback to just the reporter if broadcast fails
                    await supabase_1.supabase.from('notifications').insert([{
                            user_id: report.user_id,
                            type: 'success',
                            title,
                            message
                        }]);
                }
                else {
                    // Create notification for EACH user
                    const notifications = users.map(user => ({
                        user_id: user.id,
                        type: 'success',
                        title,
                        message,
                        is_read: false
                    }));
                    // Bulk insert
                    const { error: insertError } = await supabase_1.supabase
                        .from('notifications')
                        .insert(notifications);
                    if (insertError)
                        throw insertError;
                }
            }
            catch (notifError) {
                console.error("Failed to send notification:", notifError);
            }
        }
        res.json({ message: "Status updated", report: data[0] });
    }
    catch (error) {
        console.error("Error updating bug report:", error);
        res.status(500).json({ error: "Failed to update bug report" });
    }
};
exports.updateBugReportStatus = updateBugReportStatus;
