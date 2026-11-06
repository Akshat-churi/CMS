import express from 'express';
import slugify from 'slugify';
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requireEditorOrAdmin } from '../middleware/rbac.js';

const router = express.Router();

// GET /api/categories - Public
router.get('/', async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve categories.' });
  }
});

// POST /api/categories - Editor or Admin
router.post('/', requireAuth, requireEditorOrAdmin, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required.' });
    }

    const generatedSlug = slug && slug.trim() 
      ? slugify(slug, { lower: true, strict: true }) 
      : slugify(name, { lower: true, strict: true });

    const newCategory = await db.createCategory({
      name: name.trim(),
      slug: generatedSlug,
      description: description || ''
    });

    await db.logActivity({
      user_id: req.user.id,
      action: 'CATEGORY_CREATE',
      target_type: 'category',
      target_id: newCategory.id,
      description: `${req.user.full_name} created category "${newCategory.name}".`
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: newCategory
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/categories/:id - Editor or Admin
router.put('/:id', requireAuth, requireEditorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (slug !== undefined) updates.slug = slugify(slug, { lower: true, strict: true });
    if (description !== undefined) updates.description = description;

    const updated = await db.updateCategory(id, updates);

    await db.logActivity({
      user_id: req.user.id,
      action: 'CATEGORY_UPDATE',
      target_type: 'category',
      target_id: id,
      description: `${req.user.full_name} updated category "${updated.name}".`
    });

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      category: updated
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/categories/:id - Editor or Admin
router.delete('/:id', requireAuth, requireEditorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteCategory(id);

    await db.logActivity({
      user_id: req.user.id,
      action: 'CATEGORY_DELETE',
      target_type: 'category',
      target_id: id,
      description: `${req.user.full_name} deleted category "${deleted.name}".`
    });

    return res.json({
      success: true,
      message: 'Category deleted successfully.',
      category: deleted
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

