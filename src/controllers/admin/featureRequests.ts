import { Response } from 'express';
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { supabase } from '../../config/supabase';

/**
 * Fetch all feature requests
 */
export const getFeatureRequests = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('feature_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ requests: data });
    } catch (error: any) {
        console.error("Error fetching feature requests:", error);
        res.status(500).json({ error: "Failed to fetch feature requests" });
    }
};

/**
 * Update feature request status
 */
export const updateFeatureRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'under_review', 'planned', 'implemented', 'discarded'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const { data, error } = await supabase
            .from('feature_requests')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Feature request not found" });
        }

        // Send Notification if planned/implemented
        if (['planned', 'implemented'].includes(status)) {
            const request = data[0];
            const title = `Feature Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
            const message = `Your feature request "${request.title}" has been marked as ${status}. Thank you for your suggestion!`;

            try {
                // Fetch profiles to notify all users (bulk announcement style as per bugReport logic)
                const { data: users, error: userError } = await supabase
                    .from('profiles')
                    .select('id');

                if (userError || !users) {
                    // Fallback to just the requester
                    await supabase.from('notifications').insert([{
                        user_id: request.user_id,
                        type: 'info',
                        title,
                        message
                    }]);
                } else {
                    const notifications = users.map(user => ({
                        user_id: user.id,
                        type: 'info',
                        title,
                        message,
                        is_read: false
                    }));

                    await supabase.from('notifications').insert(notifications);
                }
            } catch (notifError) {
                console.error("Failed to send notification:", notifError);
            }
        }

        res.json({ message: "Status updated", request: data[0] });
    } catch (error: any) {
        console.error("Error updating feature request:", error);
        res.status(500).json({ error: "Failed to update feature request" });
    }
};
