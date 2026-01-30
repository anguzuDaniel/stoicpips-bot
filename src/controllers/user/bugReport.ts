import { Response } from 'express';
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { supabase } from '../../config/supabase';

/**
 * Saves a user's bug report to the database
 */
export const reportBug = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { title, description, steps, severity } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        const { data, error } = await supabase
            .from('bug_reports')
            .insert([{
                user_id: userId,
                title,
                description,
                steps: steps || '',
                severity: severity || 'low',
                status: 'open',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Bug report submitted successfully. Our team will look into it.",
            report: data[0]
        });
    } catch (error: any) {
        console.error("Error submitting bug report:", error);
        res.status(500).json({ error: "Failed to submit bug report. Please try again later." });
    }
};
