import express from 'express';
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/stats/dashboard - Actual database statistics
router.get('/dashboard', async (req, res) => {
  try {
    const statsData = await db.getDashboardStats(req.user);
    return res.json({
      success: true,
      data: statsData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics.'
    });
  }
});

export default router;

