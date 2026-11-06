import express from 'express';
import slugify from 'slugify';
import { db } from '../config/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Helper to generate a clean URL slug
const createSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
};

// ==============================================================================
// PUBLIC ENDPOINTS
// ==============================================================================

// GET /api/contents - Public feed (only published items)
router.get('/', async (req, res) => {
  try {
    const { type, categoryId, search, tag, page = 1, limit = 10, sort = 'newest' } = req.query;

    const result = await db.getPublishedContents({
      type,
      categoryId,
      search,
      tag,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching public contents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve published content.'
    });
  }
});

// GET /api/contents/slug/:slug - Public single content view
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const content = await db.getContentBySlug(slug);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found.'
      });
    }

    // Only allow viewing published items publicly unless authenticated author/editor
    if (content.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Content is not published or has been moved.'
      });
    }

    // Fetch up to 3 related published items
    const related = (await db.getPublishedContents({
      type: content.content_type,
      categoryId: content.category_id,
      limit: 4
    })).contents.filter(item => item.id !== content.id).slice(0, 3);

    return res.json({
      success: true,
      content,
      related
    });
  } catch (error) {
    console.error('Error fetching content by slug:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve content.'
    });
  }
});

// ==============================================================================
// PROTECTED CMS MANAGEMENT ENDPOINTS
// ==============================================================================

// GET /api/contents/manage - Content list for CMS dashboard with RBAC
router.get('/manage', requireAuth, async (req, res) => {
  try {
    const { status, type, categoryId, search, page = 1, limit = 20 } = req.query;

    const result = await db.getContentsForManagement({
      status,
      type,
      categoryId,
      search,
      user: req.user,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching management contents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve CMS content list.'
    });
  }
});

// GET /api/contents/:id - Single content view for CMS editor
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await db.getContentById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found.'
      });
    }

    // RBAC: Authors can only view their own non-published content
    if (req.user.role === 'author' && content.author_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to view this content.'
      });
    }

    return res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve content.'
    });
  }
});

// POST /api/contents - Create new content
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      body,
      content_type,
      featured_image,
      category_id,
      tags,
      status,
      seo_title,
      meta_description,
      keywords
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Content title is required.'
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Content body text is required.'
      });
    }

    const generatedSlug = slug && slug.trim() ? createSlug(slug) : createSlug(title);

    const newContent = await db.createContent({
      title: title.trim(),
      slug: generatedSlug,
      description: description || '',
      body: body.trim(),
      content_type: content_type || 'article',
      featured_image: featured_image || null,
      category_id: category_id || null,
      tags: Array.isArray(tags) ? tags : [],
      status: status || 'draft',
      seo_title,
      meta_description,
      keywords
    }, req.user);

    await db.logActivity({
      user_id: req.user.id,
      action: 'CONTENT_CREATE',
      target_type: 'content',
      target_id: newContent.id,
      description: `${req.user.full_name} (${req.user.role}) created new ${newContent.content_type}: "${newContent.title}" [status: ${newContent.status}]`
    });

    return res.status(201).json({
      success: true,
      message: 'Content created successfully.',
      content: newContent
    });
  } catch (error) {
    console.error('Content creation error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create content.'
    });
  }
});

// PUT /api/contents/:id - Update content
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      body,
      content_type,
      featured_image,
      category_id,
      tags,
      status,
      seo_title,
      meta_description,
      keywords
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (slug !== undefined && slug.trim()) updates.slug = createSlug(slug);
    if (description !== undefined) updates.description = description;
    if (body !== undefined) updates.body = body;
    if (content_type !== undefined) updates.content_type = content_type;
    if (featured_image !== undefined) updates.featured_image = featured_image;
    if (category_id !== undefined) updates.category_id = category_id;
    if (tags !== undefined) updates.tags = tags;
    if (status !== undefined) updates.status = status;
    if (seo_title !== undefined) updates.seo_title = seo_title;
    if (meta_description !== undefined) updates.meta_description = meta_description;
    if (keywords !== undefined) updates.keywords = keywords;

    const updated = await db.updateContent(id, updates, req.user);

    await db.logActivity({
      user_id: req.user.id,
      action: 'CONTENT_UPDATE',
      target_type: 'content',
      target_id: updated.id,
      description: `${req.user.full_name} edited ${updated.content_type}: "${updated.title}"`
    });

    return res.json({
      success: true,
      message: 'Content updated successfully.',
      content: updated
    });
  } catch (error) {
    console.error('Content update error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update content.'
    });
  }
});

// POST /api/contents/:id/submit - Author submits content for review
router.post('/:id/submit', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await db.getContentById(id);

    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found.' });
    }

    if (req.user.role === 'author' && content.author_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only submit your own content.' });
    }

    if (content.status === 'published') {
      return res.status(400).json({ success: false, error: 'This content is already published.' });
    }

    const updated = await db.updateContent(id, { status: 'pending_review' }, req.user);

    await db.logActivity({
      user_id: req.user.id,
      action: 'CONTENT_SUBMIT',
      target_type: 'content',
      target_id: updated.id,
      description: `${req.user.full_name} submitted "${updated.title}" for editorial review.`
    });

    return res.json({
      success: true,
      message: 'Content submitted for editorial review successfully.',
      content: updated
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/contents/:id/review - Editor/Admin approves or rejects content
router.post('/:id/review', requireAuth, requireEditorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review action. Must be "approve" or "reject".'
      });
    }

    const content = await db.getContentById(id);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found.' });
    }

    let updates = {};
    let logAction = '';
    let logMsg = '';

    if (action === 'approve') {
      updates = {
        status: 'published',
        published_at: new Date().toISOString(),
        rejection_reason: null
      };
      logAction = 'CONTENT_PUBLISH';
      logMsg = `${req.user.full_name} approved and published "${content.title}".`;
    } else {
      updates = {
        status: 'rejected',
        rejection_reason: rejection_reason || 'Does not meet editorial guidelines.'
      };
      logAction = 'CONTENT_REJECT';
      logMsg = `${req.user.full_name} rejected "${content.title}". Reason: ${updates.rejection_reason}`;
    }

    const updated = await db.updateContent(id, updates, req.user);

    await db.logActivity({
      user_id: req.user.id,
      action: logAction,
      target_type: 'content',
      target_id: updated.id,
      description: logMsg
    });

    return res.json({
      success: true,
      message: action === 'approve' ? 'Content approved and published successfully.' : 'Content rejected with feedback.',
      content: updated
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/contents/:id - Delete content with RBAC
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await db.getContentById(id);

    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found.' });
    }

    const deleted = await db.deleteContent(id, req.user);

    await db.logActivity({
      user_id: req.user.id,
      action: 'CONTENT_DELETE',
      target_type: 'content',
      target_id: id,
      description: `${req.user.full_name} deleted ${content.content_type}: "${content.title}"`
    });

    return res.json({
      success: true,
      message: 'Content deleted successfully.',
      content: deleted
    });
  } catch (error) {
    return res.status(403).json({ success: false, error: error.message });
  }
});

// GET /api/contents/:id/versions - Content revision history
router.get('/:id/versions', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await db.getContentById(id);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found.' });
    }

    if (req.user.role === 'author' && content.author_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: Cannot view version history of other authors.' });
    }

    const versions = await db.getContentVersions(id);
    return res.json({
      success: true,
      versions
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

