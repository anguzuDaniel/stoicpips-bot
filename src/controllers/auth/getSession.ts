import type { Request, Response } from "express";

const { supabase } = require('../../config/supabase');

export const getSession = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return res.status(401).json({ error: "Invalid token" });

  res.json({ user: data.user });
};