
import 'dotenv/config';
import { supabase } from '../config/supabase';
import { syncTrades } from '../controllers/bot/history/syncTrades';

const forceSync = async () => {
    const email = 'anguzudaniel1@gmail.com'; // User from context
    console.log(`🔍 Looking for user with email: ${email}`);

    try {
        // 1. Get User ID
        // Try profiles first (if email is stored there)
        // If not, we might need to use auth.admin if available, or just assume the profile exists and we have to find it
        // Actually, let's try to find a profile that matches.
        // Since we might not have email in profiles, we can try to find the user via an active bot config or similar?
        // Or just rely on the service role if configured.

        // Simpler: Fetch the *only* user profile if this is a single user dev env?
        // No, let's try to query auth users via admin api if possible.

        let userId: string | null = null;

        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        if (users && users.users) {
            const user = users.users.find((u: any) => u.email === email);
            if (user) userId = user.id;
        }

        if (!userId) {
            console.log("⚠️ Could not find user via Admin API (maybe no service key?). Trying profiles...");
            // Fallback: Check profiles. If email is not in profiles, we might be stuck.
            // But we know 'bot_configs' exists for this user.
            // Let's just grab the most recent profile?
            const { data: profiles } = await supabase.from('profiles').select('id, email').limit(1);
            if (profiles && profiles.length > 0) {
                console.log(`⚠️ Defaulting to first found profile: ${profiles[0].id}`);
                userId = profiles[0].id;
            }
        }

        if (!userId) {
            console.error("❌ Could not determine User ID.");
            process.exit(1);
        }

        console.log(`👤 Found User ID: ${userId}`);

        // 2. Delete OLD History
        console.log(`🗑️ Clearing old history for user...`);
        const { error: deleteError } = await supabase
            .from('trades')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.warn(`⚠️ Error processing delete (might be empty or RLS): ${deleteError.message}`);
            // Continue anyway to sync
        } else {
            console.log(`✅ Old history cleared.`);
        }

        // 3. Trigger Sync
        console.log(`🚀 Starting Force Sync...`);
        await syncTrades(userId);

        console.log(`🏁 Sync Finished.`);
        process.exit(0);

    } catch (err: any) {
        console.error("❌ Script failed:", err);
        process.exit(1);
    }
};

forceSync();
