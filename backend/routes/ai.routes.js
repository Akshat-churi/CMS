import express from 'express';
import { aiService } from '../services/ai.service.js';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../config/db.js';

const router = express.Router();

// Simple in-memory sliding window rate limiter (30 requests/minute per user)
const requestCounts = new Map();
const rateLimiter = (req, res, next) => {
  const userId = req.user?.id || req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  if (!requestCounts.has(userId)) {
    requestCounts.set(userId, []);
  }

  const timestamps = requestCounts.get(userId).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded: Please wait a moment before sending more AI requests.',
      isUnavailable: false
    });
  }

  timestamps.push(now);
  requestCounts.set(userId, timestamps);
  next();
};

// GET /api/ai/status - Check if AI is configured and operational
router.get('/status', (req, res) => {
  const status = aiService.getStatus();
  return res.json({
    success: true,
    ...status,
    message: status.available 
      ? `AI Assistant is online using ${status.model} (${status.provider}).`
      : 'AI Assistant is currently unavailable. You can continue managing your content manually.'
  });
});

// All AI action endpoints require authentication and rate limiting
router.use(requireAuth);
router.use(rateLimiter);

// POST /api/ai/generate - Generate draft content
router.post('/generate', async (req, res) => {
  try {
    const { topic, content_type, target_audience, writing_tone, content_length } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required for AI content generation.'
      });
    }

    const generated = await aiService.generateContent({
      topic: topic.trim(),
      contentType: content_type || 'article',
      targetAudience: target_audience,
      writingTone: writing_tone || 'professional',
      contentLength: content_length || 'medium'
    });

    await db.logActivity({
      user_id: req.user.id,
      action: 'AI_CONTENT_GENERATE',
      target_type: 'ai',
      target_id: null,
      description: `${req.user.full_name} generated draft with AI for topic: "${topic.slice(0, 50)}"`
    });

    return res.json({
      success: true,
      data: generated
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.',
      isUnavailable: Boolean(error.isUnavailable)
    });
  }
});

// POST /api/ai/improve - Improve selected or full text
router.post('/improve', async (req, res) => {
  try {
    const { text, instruction, tone } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text to improve is required.'
      });
    }

    const improved = await aiService.improveWriting({
      text: text.trim(),
      instruction: instruction || 'improve_writing',
      tone
    });

    return res.json({
      success: true,
      data: improved
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.',
      isUnavailable: Boolean(error.isUnavailable)
    });
  }
});

// POST /api/ai/seo - Generate SEO metadata & recommendations
router.post('/seo', async (req, res) => {
  try {
    const { title, description, body } = req.body;

    if (!title && !body) {
      return res.status(400).json({
        success: false,
        error: 'Title or content body is required for SEO generation.'
      });
    }

    const seoData = await aiService.generateSEO({ title, description, body });

    return res.json({
      success: true,
      data: seoData
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.',
      isUnavailable: Boolean(error.isUnavailable)
    });
  }
});

// POST /api/ai/summarize - Summarize content
router.post('/summarize', async (req, res) => {
  try {
    const { text, content_type } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text to summarize is required.'
      });
    }

    const summary = await aiService.summarizeContent({
      text: text.trim(),
      contentType: content_type || 'article'
    });

    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.',
      isUnavailable: Boolean(error.isUnavailable)
    });
  }
});

// POST /api/ai/review - Advisory content review
router.post('/review', async (req, res) => {
  try {
    const { title, body, content_type } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Content body is required for AI editorial review.'
      });
    }

    const reviewData = await aiService.reviewContent({
      title,
      body: body.trim(),
      contentType: content_type || 'article'
    });

    return res.json({
      success: true,
      data: reviewData
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.',
      isUnavailable: Boolean(error.isUnavailable)
    });
  }
});

export default router;

