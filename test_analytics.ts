
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.join(__dirname, '.env') });
const { supabase } = require('./src/config/supabase');

const run = async () => {
    try {
        const userId = "355e7fe2-34f4-4d7d-8c28-78ce2f53009e"; // The ID found in trade_check.txt
        console.log(`Testing analytics for user ${userId}`);

        const { data: trades, error } = await supabase
            .from('trades')
            .select('entry_price, payout, pnl, status, contract_type, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            fs.writeFileSync('analytics_test.txt', `DB Error: ${error.message}`);
            return;
        }

        if (!trades || trades.length === 0) {
            fs.writeFileSync('analytics_test.txt', "No trades found for this user.");
            return;
        }

        let totalProfit = 0;
        const profitHistory: any[] = [];
        let cumulativeProfit = 0;

        trades.forEach((trade: any) => {
            const pnl = parseFloat(trade.pnl);
            totalProfit += pnl;
            cumulativeProfit += pnl;

            profitHistory.push({
                date: new Date(trade.created_at).toLocaleDateString(),
                profit: cumulativeProfit,
                dailyPnl: pnl
            });
        });

        fs.writeFileSync('analytics_test.txt', JSON.stringify(profitHistory.slice(-5), null, 2));

    } catch (e: any) {
        fs.writeFileSync('analytics_test.txt', `Crash: ${e.message}`);
    }
    process.exit(0);
};
run();
