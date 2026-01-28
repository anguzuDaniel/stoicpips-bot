import { Request, Response } from "express";

const { supabase } = require('../../config/supabase');

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email & password required" });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) return res.status(401).json({ error: error?.message || "Login failed" });

  res.json({ user: data.user, session: data.session });
};