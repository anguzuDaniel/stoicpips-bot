require('dotenv').config();

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

module.exports = {
  createClient: createClient,
  supabase: createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
};