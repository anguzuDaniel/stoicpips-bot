import { supabase } from "../../config/supabase";

/**
 * Fetches the user profile from the profiles table.
 */
export const getUserProfile = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, return null user so frontend can show empty form
        return res.json({ user: null });
      }
      console.error(`❌ [${userId}] Fetch profile error:`, error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      user: {
        ...data,
        is_email_verified: req.user.isEmailVerified
      }
    });
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};