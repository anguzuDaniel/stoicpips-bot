"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
// Found ID from users_dump.json
const TARGET_ID = '355e7fe2-34f4-4d7d-8c28-78ce2f53009e';
async function main() {
    console.error(`Starting upgrade for user ID: ${TARGET_ID}...`);
    // 1. Update
    const { error: updateError } = await supabase_1.supabase
        .from('profiles')
        .update({
        subscription_tier: 'elite',
        subscription_status: 'active',
        updated_at: new Date().toISOString()
    })
        .eq('id', TARGET_ID);
    if (updateError) {
        console.error("Failed to upgrade user:", updateError.message);
    }
    else {
        console.error("Update command sent. Verifying...");
        // 2. Verify
        const { data: profile, error: fetchError } = await supabase_1.supabase
            .from('profiles')
            .select('email, subscription_tier, subscription_status')
            .eq('id', TARGET_ID)
            .single();
        if (fetchError) {
            console.error("Verification fetch failed:", fetchError.message);
        }
        else {
            console.error("✅ Verification Result:");
            console.error(`Email: ${profile.email}`);
            console.error(`Tier: ${profile.subscription_tier}`);
            console.error(`Status: ${profile.subscription_status}`);
        }
    }
}
main().catch(console.error);
