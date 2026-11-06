import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'contentpilot-super-secret-jwt-key-2026-phase1';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No authorization token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let userId = null;
    let userEmail = null;

    // 1. If Supabase is configured, try Supabase auth verification
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
          userEmail = user.email;
        }
      } catch (err) {
        // Fallback to local JWT decode
      }
    }

    // 2. Local JWT fallback
    if (!userId) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
        userEmail = decoded.email;
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          error: 'Session expired or token is invalid. Please log in again.'
        });
      }
    }

    // 3. Fetch user profile from database
    const profile = await db.getProfileById(userId);
    if (!profile) {
      return res.status(401).json({
        success: false,
        error: 'User profile does not exist.'
      });
    }

    // 4. Check if account is active
    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated by an administrator.'
      });
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed due to an internal server error.'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    let userId = null;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) userId = user.id;
      } catch (err) {}
    }

    if (!userId) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    if (userId) {
      const profile = await db.getProfileById(userId);
      if (profile && profile.is_active) {
        req.user = profile;
      }
    }
  } catch (e) {
    req.user = null;
  }
  next();
};

