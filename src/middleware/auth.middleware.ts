import { supabase } from '../config/supabase';

/**
 * Enhanced authentication middleware that fetches the latest user profile from the database.
 */
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Always fetch the latest profile from DB as the source of truth
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, is_admin, is_active')
      .eq('id', user.id)
      .single();

    if (profile?.is_active === false) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      isEmailVerified: !!user.email_confirmed_at,
      subscription_status: profile?.subscription_tier || 'free',
      subscription_tier: profile?.subscription_tier || 'free',
      isAdmin: profile?.is_admin || false,
      isActive: profile?.is_active ?? true
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requirePaidUser = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const hasPaidSubscription = req.user.subscription_status === 'active' ||
    req.user.subscription_status === 'premium' ||
    req.user.subscription_tier === 'pro' ||
    req.user.subscription_tier === 'elite';

  if (!hasPaidSubscription) {
    return res.status(403).json({ error: 'Paid subscription required' });
  }

  next();
};

export const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
