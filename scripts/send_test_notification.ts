
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log("🚀 Sending test notification to ALL users...");

    // 1. Fetch all users (from profiles if existing, or just insert blindly for known user if strictly testing)
    // Check profiles table
    const { data: users, error: userError } = await supabase.from('profiles').select('id');

    if (userError || !users || users.length === 0) {
        console.error("❌ Failed to fetch users or no users found:", userError);
        return;
    }

    console.log(`Found ${users.length} users.`);

    const notifications = users.map(user => ({
        user_id: user.id,
        type: 'info',
        title: 'Backend Connectivity Test',
        message: 'If you see this, the notification system is fully operational.',
        is_read: false,
        created_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase.from('notifications').insert(notifications);

    if (insertError) {
        console.error("❌ Failed to insert notifications:", insertError);
    } else {
        console.log("✅ Successfully sent test notifications to all users.");
    }
}

main();
