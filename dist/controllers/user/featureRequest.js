"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestFeature = void 0;
const supabase_1 = require("../../config/supabase");
/**
 * Saves a user's feature request to the database
 */
const requestFeature = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, impact } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }
        const { data, error } = await supabase_1.supabase
            .from('feature_requests')
            .insert([{
                user_id: userId,
                title,
                description,
                impact: impact || '',
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select();
        if (error)
            throw error;
        res.status(201).json({
            message: "Feature request submitted successfully. Thank you for your suggestion!",
            request: data[0]
        });
    }
    catch (error) {
        console.error("Error submitting feature request:", error);
        res.status(500).json({ error: "Failed to submit feature request. Please try again later." });
    }
};
exports.requestFeature = requestFeature;
