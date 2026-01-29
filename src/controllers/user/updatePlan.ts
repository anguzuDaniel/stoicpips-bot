import { supabase } from "../../config/supabase";

/**
 * Updates the user's subscription plan directly in the profiles table.
 * (Alternative to manual payment flow for testing/admin use)
 */
export const updatePlan = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { plan, status } = req.body;

    if (!plan || !status) {
      return res.status(400).json({ error: "Plan & status required" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        subscription_tier: plan,
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error(`❌ [${userId}] Update plan error:`, error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: "Plan updated successfully",
      subscription: data
    });
  } catch (err) {
    console.error("updatePlan error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};