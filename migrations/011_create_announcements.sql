-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(email text)
RETURNS boolean AS $$
BEGIN
  -- Check if the email belongs to an admin
  -- You can update this list or use a separate table
  RETURN email IN ('stoicpip@gmail.com', 'admin@dunam.ai'); 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin_announcements table
CREATE TABLE IF NOT EXISTS public.admin_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'urgent', 'success')) DEFAULT 'info',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Admins can do everything
CREATE POLICY "Admins can manage announcements" 
ON public.admin_announcements 
TO authenticated 
USING (
  public.is_admin(auth.email())
);

-- 2. Everyone (authenticated) can view active announcements
CREATE POLICY "Users can view active announcements" 
ON public.admin_announcements FOR SELECT 
TO authenticated 
USING (
  (expires_at IS NULL OR expires_at > NOW())
);

-- Grant access
GRANT ALL ON public.admin_announcements TO authenticated;
GRANT ALL ON public.admin_announcements TO service_role;
