"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTrial = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Starts the 7-day free trial for the user.
 * Sets has_started_trial to true and trial_start_date to current timestamp.
 */
const startTrial = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: "User unauthorized" });
        }
        console.log(`🚀 [${userId}] Attempting to start 7-day trial...`);
        // 1. Check if trial already started or if record exists
        const { data: profile, error: fetchError } = await supabase_1.supabase
            .from("profiles")
            .select("has_started_trial, is_subscribed")
            .eq("id", userId)
            .maybeSingle();
        if (fetchError) {
            console.error(`❌ [${userId}] Fetch profile error:`, fetchError.message);
            return res.status(400).json({ error: `Fetch error: ${fetchError.message}` });
        }
        if (profile?.has_started_trial) {
            return res.status(400).json({ error: "Trial has already been started for this account." });
        }
        // 2. Prepare update data
        const trialData = {
            has_started_trial: true,
            trial_start_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        let result;
        if (!profile) {
            // Profile doesn't exist, create it
            console.log(`🆕 [${userId}] Profile record missing. Creating...`);
            result = await supabase_1.supabase
                .from("profiles")
                .insert([{ ...trialData, id: userId }])
                .select()
                .single();
        }
        else {
            // Profile exists, update it
            result = await supabase_1.supabase
                .from("profiles")
                .update(trialData)
                .eq("id", userId)
                .select()
                .single();
        }
        if (result.error) {
            console.error(`❌ [${userId}] Save trial error:`, result.error.message);
            return res.status(400).json({ error: `Save error: ${result.error.message}` });
        }
        return res.json({
            message: "7-Day Free Trial started successfully.",
            profile: result.data
        });
    }
    catch (err) {
        console.error("startTrial error:", err);
        res.status(500).json({ error: err.message || "Server internal error" });
    }
};
exports.startTrial = startTrial;
