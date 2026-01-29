import { supabase } from '../../../config/supabase';
import { botStates } from '../../../types/botStates';

/**
 * Fetch trade history for the authenticated user
 */
export const getTradeHistory = async (req: any, res: any) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 50, start_date, end_date, status } = req.query;

        const limitNum = Number(limit);
        const botState = botStates.get(userId);

        const offset = (Number(page) - 1) * limitNum;

        let query = supabase
            .from('trades')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limitNum - 1);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (start_date) {
            query = query.gte('created_at', (start_date as string));
        }

        if (end_date) {
            query = query.lte('created_at', (end_date as string));
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
                limit: limitNum,
                pages: Math.ceil((count || 0) / limitNum)
            }
        });

    } catch (error: any) {
        console.error('Get trade history error:', error);
        res.status(500).json({ error: 'Failed to fetch trade history' });
    }
};
