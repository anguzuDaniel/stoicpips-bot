import { Request, Response } from "express";
import { supabase } from '../../config/supabase';

/**
 * Handles user signup and creates an initial entry in the profiles table.
 */
export const signupUser = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (error) {
      console.error(`❌ Signup failure for ${email}:`, error.message);
      return res.status(error.status || 400).json({ error: error.message });
    }

    if (data.user) {
      // Initial profile creation is usually handled by Supabase triggers, 
      // but we can ensure it here if triggers are not set up.
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        subscription_tier: 'free',
        subscription_status: 'inactive'
      });

      // Send Welcome Notification
      await supabase.from('notifications').insert([{
        user_id: data.user.id,
        type: 'info',
        title: 'Welcome to Dunam Ai Beta! 🚀',
        message: 'Welcome to the beta version! We are constantly working on making the experience better. Please try it out and give us your feedback to help us improve.',
        is_read: false
      }]);
    }

    res.status(201).json({ user: data.user });
  } catch (err: any) {
    console.error("Signup controller error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
};