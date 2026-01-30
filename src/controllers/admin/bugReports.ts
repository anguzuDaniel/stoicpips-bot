import { Response } from 'express';
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { supabase } from '../../config/supabase';

/**
 * Fetch all bug reports
 */
export const getBugReports = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('bug_reports')
            .select('*, users(email, full_name)')
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

        res.json({ message: "Status updated", report: data[0] });
    } catch (error: any) {
        console.error("Error updating bug report:", error);
        res.status(500).json({ error: "Failed to update bug report" });
    }
};
