"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
const TARGET_ID = '355e7fe2-34f4-4d7d-8c28-78ce2f53009e';
async function refreshUserDate() {
    console.log(`Refreshing created_at for user ${TARGET_ID} to simulate new user...`);
    // We also need to set them to 'free' tier just in case
    const { error } = await supabase_1.supabase
        .from('profiles')
        .update({
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })
        .eq('id', TARGET_ID);
    if (error) {
        console.error("Error:", error.message);
    }
    else {
        console.log("✅ User created_at updated to NOW. Trial should be active.");
    }
}
refreshUserDate().catch(console.error);
