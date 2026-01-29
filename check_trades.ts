
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.join(__dirname, '.env') });
const { supabase } = require('./src/config/supabase');

const run = async () => {
    try {
        const { data: trades, error } = await supabase.from('trades').select('id, user_id, created_at').limit(5);
        if (error) {
            fs.writeFileSync('trade_check.txt', `Error: ${error.message}`);
        } else {
            fs.writeFileSync('trade_check.txt', JSON.stringify(trades, null, 2));
        }
    } catch (e: any) {
        fs.writeFileSync('trade_check.txt', `Crash: ${e.message}`);
    }
    process.exit(0);
};
run();
