import express from 'express';
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requireEditorOrAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireEditorOrAdmin);

// GET /api/activity-logs - List activity logs with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 30, action, userId } = req.query;

    const result = await db.getActivityLogs({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      action,
      userId
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve activity audit logs.' });
  }
});

export default router;

