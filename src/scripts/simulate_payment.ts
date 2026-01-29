
import { supabase } from '../config/supabase';

// Found ID from users_dump.json
const TARGET_ID = '355e7fe2-34f4-4d7d-8c28-78ce2f53009e';

async function upgradeUser() {
    console.error(`Starting upgrade for user ID: ${TARGET_ID}...`);

    // 2. Update the subscription status directly
    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
            subscription_tier: 'elite',
            subscription_status: 'active',
            updated_at: new Date().toISOString()
        })
        .eq('id', TARGET_ID)
        .select()
        .single();

    if (updateError) {
        console.error("Failed to upgrade user:", updateError.message);
        process.exit(1);
    } else {
        console.error("✅ User successfully upgraded to ELITE status!");
        // console.error("New Status:", updatedProfile.subscription_status);
        // console.error("New Tier:", updatedProfile.subscription_tier);
        process.exit(0);
    }
}

upgradeUser().catch(err => {
    console.error("Unexpected error:", err);
    process.exit(1);
});
