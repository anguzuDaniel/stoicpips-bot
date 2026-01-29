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

        const limitNum = Number(limit);
        const botStates = require('../../../types/botStates');
        const botState = botStates.get(userId);

        // 1. Try fetching from Deriv if connected
        if (botState && botState.derivWS && botState.derivWS.getStatus().authorized) {
            console.log(`📡 Fetching profit table from Deriv (History) for user ${userId}`);
            try {
                const derivTrades = await botState.derivWS.getProfitTable(limitNum);

                // Map to schema
                const trades = derivTrades.map((t: any) => ({
                    id: t.transaction_id, // Use txn id as ID
                    user_id: userId,
                    symbol: t.shortcode || 'UKN', // shortcode often contains symbol
                    contract_type: t.longcode.includes('CALL') ? 'CALL' : t.longcode.includes('PUT') ? 'PUT' : 'UNKNOWN',
                    amount: t.buy_price,
                    entry_price: t.buy_price,
                    payout: t.sell_price,
                    status: (parseFloat(t.sell_price) - parseFloat(t.buy_price)) >= 0 ? 'won' : 'lost',
                    pnl: parseFloat(t.sell_price) - parseFloat(t.buy_price),
                    created_at: new Date(t.purchase_time * 1000).toISOString(),
                    contract_id: t.contract_id
                }));

                return res.json({
                    trades,
                    pagination: {
                        total: trades.length,
                        page: 1,
                        limit: limitNum,
                        pages: 1
                    }
                });

            } catch (err) {
                console.error("Failed to fetch Deriv history, falling back to DB:", err);
            }
        }

        // 2. DB Fallback
        const offset = (Number(page) - 1) * limitNum;

        let query = supabase
            .from('trades')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limitNum - 1);

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
                limit: limitNum,
                pages: Math.ceil((count || 0) / limitNum)
            }
        });

    } catch (error: any) {
        console.error('Get trade history error:', error);
        res.status(500).json({ error: 'Failed to fetch trade history' });
    }
};

export { getTradeHistory };
