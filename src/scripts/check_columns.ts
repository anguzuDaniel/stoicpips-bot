require('dotenv').config();
const { supabase } = require('../config/supabase');

async function checkColumns() {
    try {
        console.log("🔍 Checking columns for 'profiles' table...");

        // This query attempts to fetch one row with all columns to see what fails or what comes back
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.error("❌ Error fetching profiles:", error.message);
        } else if (data && data.length > 0) {
            console.log("✅ Columns found in profiles:", Object.keys(data[0]));
        } else {
            console.log("⚠️ No rows found in profiles table to inspect columns.");

            // Try explicit select of suspected columns
            const { error: e2 } = await supabase
                .from('profiles')
                .select('bank_name, account_number, account_name')
                .limit(1);

            if (e2) {
                console.error("❌ Validation failed for card info columns:", e2.message);
            } else {
                console.log("✅ card info columns (bank_name, account_number, account_name) seem to exist (validated via select).");
            }
        }
    } catch (e) {
        console.error("💥 Crash during diagnosis:", e.message);
    }
    process.exit(0);
}

checkColumns();
