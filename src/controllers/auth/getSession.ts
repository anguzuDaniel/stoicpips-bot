import { Request, Response } from "express";
import { supabase } from '../../config/supabase';

/**
 * Retrieves the current authenticated user's session and profile.
 */
export const getSession = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return res.status(401).json({ error: error?.message || "Invalid session" });

    // Fetch full profile from the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ user, profile });
  } catch (err: any) {
    console.error("getSession error:", err);
    res.status(500).json({ error: "Server error while fetching session" });
  }
};