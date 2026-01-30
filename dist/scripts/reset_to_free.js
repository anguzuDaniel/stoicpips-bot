"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
const TARGET_ID = '355e7fe2-34f4-4d7d-8c28-78ce2f53009e';
async function resetUser() {
    console.log(`Resetting user ${TARGET_ID} to FREE tier...`);
    const { error } = await supabase_1.supabase
        .from('profiles')
        .update({
        subscription_tier: 'free',
        subscription_status: 'active',
        updated_at: new Date().toISOString()
    })
        .eq('id', TARGET_ID);
    if (error) {
        console.error("Error:", error.message);
    }
    else {
        console.log("✅ User reset to FREE tier.");
    }
}
resetUser().catch(console.error);
