import express from 'express';
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Apply auth and admin check to all user management routes
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/users - List all users with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const result = await db.getAllProfiles({
      search,
      role,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve users.' });
  }
});

// PUT /api/users/:id/role - Assign role (Admin only, cannot change self, last admin protected)
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'editor', 'author'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: admin, editor, author.'
      });
    }

    // Prevent changing own role
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Forbidden: Administrators cannot modify their own role. Another administrator must perform this action.'
      });
    }

    const targetUser = await db.getProfileById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const previousRole = targetUser.role;
    const updated = await db.updateProfile(id, { role });

    await db.logActivity({
      user_id: req.user.id,
      action: 'ROLE_CHANGE',
      target_type: 'user',
      target_id: id,
      description: `Admin ${req.user.full_name} changed role of ${targetUser.full_name} (${targetUser.email}) from '${previousRole}' to '${role}'.`
    });

    return res.json({
      success: true,
      message: `Role for ${updated.full_name} updated to ${role}.`,
      user: updated
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/status - Toggle activate/deactivate account
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Field is_active must be a boolean (true or false).'
      });
    }

    // Prevent deactivating self
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Forbidden: You cannot deactivate your own administrative account.'
      });
    }

    const targetUser = await db.getProfileById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const updated = await db.updateProfile(id, { is_active });

    await db.logActivity({
      user_id: req.user.id,
      action: is_active ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      target_type: 'user',
      target_id: id,
      description: `Admin ${req.user.full_name} ${is_active ? 'activated' : 'deactivated'} account for ${targetUser.full_name} (${targetUser.email}).`
    });

    return res.json({
      success: true,
      message: `Account for ${updated.full_name} ${is_active ? 'activated' : 'deactivated'}.`,
      user: updated
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

