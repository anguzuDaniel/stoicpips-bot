import { Request, Response } from "express";

const { supabase } = require('../../config/supabase');

export const signupUser = async (req: Request, res: Response) => {
  const { email, password, first_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email & password required" });

  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name } } });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ user: data.user });
};