import { Response } from 'express';
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
const { supabase } = require('../../../config/supabase');

/**
 * Fetch trade history for the authenticated user
 * Supports pagination and filtering by date
 */
const getTradeHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 50, start_date, end_date } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        let query = supabase
            .from('trades')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);

        if (start_date) {
            query = query.gte('created_at', start_date);
        }

        if (end_date) {
            query = query.lte('created_at', end_date);
        }

        const { data: trades, error, count } = await query;

        if (error) {
            console.error(`❌ [${userId}] Fetch trades error:`, error.message);
            return res.status(400).json({ error: error.message });
        }

        res.json({
            trades,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil((count || 0) / Number(limit))
            }
        });

    } catch (error: any) {
        console.error('Get trade history error:', error);
        res.status(500).json({ error: 'Failed to fetch trade history' });
    }
};

export { getTradeHistory };
