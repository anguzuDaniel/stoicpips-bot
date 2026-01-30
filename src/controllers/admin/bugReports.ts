import { Response } from 'express';
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { supabase } from '../../config/supabase';

/**
 * Fetch all bug reports
 */
export const getBugReports = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Removed .select('*, users(email, full_name)') because public.users table does not exist
        // and we cannot easily join auth.users via public API without a view/wrapper.
        // For now, we will just fetch the bug reports. 
        // Ideally we would fetch user emails separately using the admin API if needed.
        // Join with profiles failed due to missing FK.
        // Reverting to simple fetch to fix 500 error.
        const { data, error } = await supabase
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ reports: data });
    } catch (error: any) {
        console.error("Error fetching bug reports:", error);
        res.status(500).json({ error: "Failed to fetch bug reports" });
    }
};

/**
 * Update bug report status
 */
export const updateBugReportStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const { data, error } = await supabase
            .from('bug_reports')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        // Send Notification if resolved/closed
        if (status === 'resolved' || status === 'closed') {
            const report = data[0];
            const title = `Bug Report ${status === 'resolved' ? 'Resolved' : 'Closed'}`;
            const message = `Your bug report "${report.title}" has been marked as ${status}. Thank you for your feedback!`;

            await supabase.from('notifications').insert([{
                user_id: report.user_id,
                type: 'success',
                title,
                message
            }]);
        }

        res.json({ message: "Status updated", report: data[0] });
    } catch (error: any) {
        console.error("Error updating bug report:", error);
        res.status(500).json({ error: "Failed to update bug report" });
    }
};
