import { supabase } from './src/config/supabase';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// We need to fetch a valid user ID first to send a notification TO.
// Let's get the ID from the last bug report or just any user.

async function testNotificationInsert() {
    console.log("=== TESTING NOTIFICATION INSERT ===");

    try {
        console.log("1. Fetching a target user...");
        // Use the imported supabase client (Service Role)
        const { data: users, error: userError } = await supabase
            .from('bug_reports')
            .select('user_id')
            .limit(1);

        if (userError || !users || users.length === 0) {
            console.error("❌ Could not search for users/bug_reports to get a valid user_id.", userError);
            return;
        }

        const userId = users[0].user_id;
        console.log("   Target User ID:", userId);

        console.log("2. Attempting Insert (Admin/Service Role)...");
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                type: 'info',
                title: 'Test Notification',
                message: 'This is a debug message from the verification script.',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error("❌ Insert FAILED:", error.message);
            console.error("   Details:", error);
            console.error("   Hint: Check RLS policies? Service Role should bypass them.");
        } else {
            console.log("✅ Insert SUCCESS:", data);
            console.log("   A notification has been created.");

            // 3. Verify Read Access (Simulate Frontend)
            console.log("3. Verifying Read Access (Row Check)...");
            const { count, error: countError } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('id', data[0].id);

            if (countError) {
                console.error("❌ Could not read back the record:", countError.message);
            } else {
                console.log("   Record exists and is readable via Service Role. Count:", count);
            }
        }

    } catch (e: any) {
        console.error("Exception:", e.message);
    }
}

testNotificationInsert();
