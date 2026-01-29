
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.join(__dirname, '.env') });
const { supabase } = require('./src/config/supabase');

const run = async () => {
    try {
        // const { data: users, error: uErr } = await supabase.from('users').select('id').limit(1);
        const userId = "355e7fe2-34f4-4d7d-8c28-78ce2f53009e";
        console.log(`Seeding trade for user ${userId}`);

        const fakeTrade = {
            user_id: userId,
            symbol: 'R_100',
            contract_type: 'CALL',
            status: 'won',
            entry_price: 10,
            payout: 19.5,
            pnl: 9.5,
            amount: 10,
            contract_id: '123456789',
            created_at: new Date()
        };

        const { error } = await supabase.from('trades').insert(fakeTrade);
        if (error) {
            fs.writeFileSync('seed_result.txt', `Insert failed: ${error.message}`);
        } else {
            fs.writeFileSync('seed_result.txt', "Success");
        }

    } catch (e: any) {
        fs.writeFileSync('seed_result.txt', `Crash: ${e.message}`);
    }
    process.exit(0);
};
run();
