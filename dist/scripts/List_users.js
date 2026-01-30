"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function listUsers() {
    console.log("Listing profiles...");
    const { data: profiles, error } = await supabase_1.supabase
        .from('profiles')
        .select('*')
        .limit(10);
    if (error) {
        console.error("Error fetching profiles:", error);
    }
    else {
        console.log("Profiles found:", profiles?.length);
        profiles?.forEach(p => {
            console.log(`ID: ${p.id}, Email: ${p.email}, Name: ${p.full_name}, Tier: ${p.subscription_tier}`);
        });
    }
}
listUsers().catch(console.error);
