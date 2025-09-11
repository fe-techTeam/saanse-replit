import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

interface AuthenticatedRequest extends Request {
  user?: {
    id: string; // Supabase UID
    email?: string;
    [key: string]: any;
  };
  dbUser?: {
    id: string; // Database user ID
    email: string;
    display_name: string | null;
    photo_url: string | null;
    supabase_uid: string;
    mobile_number: string | null;
    created_at: string;
  };
  authType?: 'supabase' | 'mobile';
}

/**
 * Verify mobile authentication token
 */
const verifyMobileToken = async (token: string): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    // Mobile tokens have format: mobile_auth_{user_id}_{timestamp}
    if (!token.startsWith('mobile_auth_')) {
      return { success: false, error: 'Invalid mobile token format' };
    }

    const parts = token.split('_');
    if (parts.length !== 4) {
      return { success: false, error: 'Invalid mobile token structure' };
    }

    const userId = parts[2];
    const timestamp = parseInt(parts[3]);

    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenAge = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return { success: false, error: 'Mobile token expired' };
    }

    // Fetch user from database
    const user = await storage.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Mobile token verification error:', error);
    return { success: false, error: 'Token verification failed' };
  }
};

/**
 * Unified authentication middleware that handles both Supabase JWT and mobile tokens
 */
export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Check if it's a mobile authentication token
    if (token.startsWith('mobile_auth_')) {
      console.log('Processing mobile authentication token');
      
      const mobileResult = await verifyMobileToken(token);
      if (!mobileResult.success) {
        return res.status(401).json({ error: mobileResult.error || 'Invalid mobile token' });
      }

      // Attach user data to request
      req.dbUser = mobileResult.user;
      req.user = {
        id: mobileResult.user!.supabase_uid,
        email: mobileResult.user!.email || mobileResult.user!.mobile, // Use mobile as fallback identifier
        mobile: mobileResult.user!.mobile || mobileResult.user!.mobile_number, // Support both fields
      };
      req.authType = 'mobile';
      
      console.log('Mobile authentication successful for user:', mobileResult.user!.id);
      return next();
    }

    // Handle Supabase JWT token
    console.log('Processing Supabase JWT token');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user exists in our database, create if not
    let dbUser = await storage.getUserBySupabaseUid(user.id);
    
    if (!dbUser) {
      console.log('User not found in database, creating user:', user.id);
      try {
        dbUser = await storage.createUser({
          supabaseUid: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.full_name || user.user_metadata?.name || '',
          photoURL: user.user_metadata?.avatar_url || null,
        });
        console.log('User created successfully:', dbUser);
      } catch (createError) {
        console.error('Failed to create user:', createError);
        // Continue anyway, the user might already exist due to race condition
      }
    }

    // Attach user data to request
    req.user = user;
    req.dbUser = dbUser;
    req.authType = 'supabase';
    
    console.log('Supabase authentication successful for user:', user.id);
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Handles both Supabase JWT and mobile tokens
 */
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without user
  }

  const token = authHeader.substring(7);

  try {
    // Check if it's a mobile authentication token
    if (token.startsWith('mobile_auth_')) {
      const mobileResult = await verifyMobileToken(token);
      if (mobileResult.success && mobileResult.user) {
        req.dbUser = mobileResult.user;
        req.user = {
          id: mobileResult.user.supabase_uid,
          email: mobileResult.user.email || mobileResult.user.mobile, // Use mobile as fallback identifier
          mobile: mobileResult.user.mobile || mobileResult.user.mobile_number, // Support both fields
        };
        req.authType = 'mobile';
      }
      return next();
    }

    // Handle Supabase JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      // Check if user exists in our database, create if not
      let dbUser = await storage.getUserBySupabaseUid(user.id);
      if (!dbUser) {
        try {
          dbUser = await storage.createUser({
            supabaseUid: user.id,
            email: user.email || '',
            displayName: user.user_metadata?.full_name || user.user_metadata?.name || '',
            photoURL: user.user_metadata?.avatar_url || null,
          });
        } catch (createError) {
          console.error('Failed to create user:', createError);
          // Continue anyway, the user might already exist
        }
      }
      req.user = user;
      req.dbUser = dbUser;
      req.authType = 'supabase';
    }
  } catch (error) {
    console.error('Optional auth error:', error);
    // Don't fail, just continue without user
  }

  next();
};

/**
 * Helper middleware to ensure database user context is available
 * This should be used after authenticateJWT or optionalAuth
 */
export const requireDbUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.dbUser) {
    return res.status(500).json({ error: 'Database user context not available' });
  }
  next();
};

/**
 * Helper function to get the database user ID from the request
 * This provides a consistent way to access the user ID across all routes
 */
export const getDbUserId = (req: AuthenticatedRequest): string | null => {
  return req.dbUser?.id || null;
};

/**
 * Helper function to get the Supabase user ID from the request
 */
export const getSupabaseUserId = (req: AuthenticatedRequest): string | null => {
  return req.user?.id || null;
};

export { AuthenticatedRequest };