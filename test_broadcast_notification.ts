import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use Service Role to simulate Admin Backend
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testBroadcast() {
    console.log("=== TESTING BROADCAST NOTIFICATIONS ===");

    try {
        // 1. Fetch All Users
        console.log("1. Fetching all profiles...");
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id');

        if (profileError || !profiles) {
            console.error("❌ Failed to fetch profiles:", profileError);
            return;
        }

        console.log(`   Found ${profiles.length} users.`);

        if (profiles.length === 0) {
            console.warn("⚠️ No profiles found. Cannot test broadcast.");
            return;
        }

        // 2. Prepare Broadcast Notification
        const testTitle = `Test Broadcast ${Date.now()}`;
        const notifications = profiles.map(user => ({
            user_id: user.id,
            type: 'info',
            title: testTitle,
            message: 'Verifying notification delivery post-restart.',
            is_read: false
        }));

        console.log(`2. Attempting to insert ${notifications.length} notifications...`);
        const { data: inserted, error: insertError } = await supabase
            .from('notifications') // Ensure table name is correct
            .insert(notifications)
            .select();

        if (insertError) {
            console.error("❌ Broadcast Insert FAILED:", insertError.message);
            console.error("   Code:", insertError.code);
            return;
        }

        console.log(`✅ Success! Inserted ${inserted.length} notifications.`);

        // 3. Verify Retrieval for a Random User
        const randomUser = profiles[0];
        console.log(`3. Verifying retrieval for user ${randomUser.id}...`);

        const { data: userNotifs, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', randomUser.id)
            .eq('title', testTitle);

        if (fetchError) {
            console.error("❌ Retrieval Failed:", fetchError.message);
        } else if (userNotifs.length > 0) {
            console.log("✅ Verified! User has the notification:", userNotifs[0]);
        } else {
            console.error("❌ Retrieval returned empty list for user.");
        }

    } catch (e: any) {
        console.error("Exception:", e.message);
    }
}

testBroadcast();
