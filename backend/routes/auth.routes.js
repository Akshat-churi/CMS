import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { supabaseAdmin, supabasePublic, isSupabaseConfigured } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'contentpilot-super-secret-jwt-key-2026-phase1';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Full name, valid email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.getProfileByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    let userId = null;

    // Supabase auth registration if configured
    if (isSupabaseConfigured && (supabasePublic || supabaseAdmin)) {
      try {
        const client = supabasePublic || supabaseAdmin;
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name, role: 'author' }
          }
        });
        if (error) {
          console.warn('[Supabase SignUp Note]:', error.message);
        } else if (data?.user) {
          userId = data.user.id;
        }
      } catch (sbErr) {
        console.warn('[Supabase SignUp Error]:', sbErr.message);
      }
    }

    // Always create profile with 'author' role by default!
    const newProfile = await db.createProfile({
      id: userId,
      full_name,
      email: cleanEmail,
      password,
      role: 'author',
      is_active: true
    });

    const token = generateToken(newProfile);

    await db.logActivity({
      user_id: newProfile.id,
      action: 'USER_REGISTER',
      target_type: 'user',
      target_id: newProfile.id,
      description: `New author registered: ${newProfile.full_name} (${newProfile.email})`
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully as Author.',
      user: newProfile,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during registration.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const profile = await db.getProfileByEmail(cleanEmail);

    if (!profile) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    let isValid = false;

    // Check Supabase Auth first if configured
    if (isSupabaseConfigured && supabasePublic) {
      try {
        const { data, error } = await supabasePublic.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (!error && data?.session) {
          isValid = true;
        }
      } catch (sbErr) {}
    }

    // Verify local password hash
    if (!isValid && profile.password_hash) {
      isValid = bcrypt.compareSync(password, profile.password_hash);
    }

    // Allow default dev seed passwords if unhashed or matched
    if (!isValid && (password === 'Admin@123' || password === 'Editor@123' || password === 'Author@123')) {
      if (
        (cleanEmail === 'admin@contentpilot.ai' && password === 'Admin@123') ||
        (cleanEmail === 'editor@contentpilot.ai' && password === 'Editor@123') ||
        (cleanEmail === 'author@contentpilot.ai' && password === 'Author@123')
      ) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const { password_hash, ...safeUser } = profile;
    const token = generateToken(safeUser);

    await db.logActivity({
      user_id: safeUser.id,
      action: 'USER_LOGIN',
      target_type: 'user',
      target_id: safeUser.id,
      description: `${safeUser.full_name} (${safeUser.role}) logged in successfully.`
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during login.'
    });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await db.logActivity({
      user_id: req.user.id,
      action: 'USER_LOGOUT',
      target_type: 'user',
      target_id: req.user.id,
      description: `${req.user.full_name} logged out.`
    });
    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    return res.json({ success: true });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, password } = req.body;
    const updates = {};
    if (full_name && full_name.trim()) updates.full_name = full_name.trim();
    if (password && password.length >= 6) {
      updates.password_hash = bcrypt.hashSync(password, 10);
    }

    const updated = await db.updateProfile(req.user.id, updates);
    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  if (isSupabaseConfigured && supabasePublic) {
    try {
      await supabasePublic.auth.resetPasswordForEmail(email);
    } catch (e) {}
  }
  return res.json({
    success: true,
    message: 'If an account exists with that email, password reset instructions have been sent.'
  });
});

export default router;

