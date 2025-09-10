import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user exists in our database, create if not
    let dbUser = await storage.getUserBySupabaseUid(user.id);
    
    if (!dbUser) {
      try {
        dbUser = await storage.createUser({
          supabaseUid: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar: user.user_metadata?.avatar_url || null,
        });
      } catch (createError) {
        console.error('Failed to create user:', createError);
        // Continue anyway, the user might already exist due to race condition or previous partial creation
      }
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without user
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      // Check if user exists in our database, create if not
      let dbUser = await storage.getUserBySupabaseUid(user.id);
      if (!dbUser) {
        console.log('User not found in database, creating user:', user.id);
        try {
          dbUser = await storage.createUser({
            supabaseUid: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar: user.user_metadata?.avatar_url || null,
          });
          console.log('User created successfully:', dbUser);
        } catch (createError) {
          console.error('Failed to create user:', createError);
          // Continue anyway, the user might already exist
        }
      }
      req.user = user;
    }
  } catch (error) {
    console.error('Optional auth error:', error);
    // Don't fail, just continue without user
  }

  next();
};

export { AuthenticatedRequest };