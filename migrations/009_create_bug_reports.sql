-- Create bug_reports table
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can create reports
CREATE POLICY "Users can create bug reports" 
ON public.bug_reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 2. Users can view their own reports
CREATE POLICY "Users can view own reports" 
ON public.bug_reports FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Admins can view all reports (assuming admin function or role check exists, otherwise we rely on service_role key for backend)
-- Ideally, we add a policy for admins if we have a way to identify them in RLS (e.g. app_metadata)
-- For now, the backend uses the SERVICE KEY (or should) to fetch all reports, bypassing RLS.
-- But if we want frontend to fetch directly via Supabase client (which AdminDashboard might eventually do?), we'd need an admin policy.
-- Since the current Admin implementation proxies requests through our Express backend, the backend's SUPERUSER/SERVICE_ROLE access will handle it.

-- Grant access
GRANT ALL ON public.bug_reports TO authenticated;
GRANT ALL ON public.bug_reports TO service_role;
