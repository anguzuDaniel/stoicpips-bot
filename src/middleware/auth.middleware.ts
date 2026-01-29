const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase').supabase;

export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      subscription_status: data.user.user_metadata?.subscription_status || 'free',
      isAdmin: data.user.user_metadata?.isAdmin || false
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requirePaidUser = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const hasPaidSubscription = req.user.subscription_status === 'active' ||
    req.user.subscription_status === 'premium';

  if (!hasPaidSubscription) {
    return res.status(403).json({ error: 'Paid subscription required' });
  }

  next();
};

export const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || !profile.is_admin) {
      console.warn(`[ADMIN ACCESS DENIED] User ${req.user.id} (${req.user.email}) attempted to access admin route: ${req.path}`);
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user.isAdmin = true;
    next();
  } catch (error) {
    console.error('[ADMIN AUTH ERROR]', error);
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
};
