import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // In serverless environments, Supabase storage takes precedence
}

// Multer storage config (memory storage so we can stream to Supabase or write locally)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const router = express.Router();

// GET /api/media - View uploaded media
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await db.getAllMedia({ page: parseInt(page, 10), limit: parseInt(limit, 10) });
    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve media library.' });
  }
});

// POST /api/media/upload - Upload new image
router.post('/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File size exceeds 5MB limit.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    try {
      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${originalName}`;
      let publicStoragePath = '';

      // 1. Try Supabase Storage upload if configured
      if (isSupabaseConfigured && supabaseAdmin) {
        try {
          const { data, error } = await supabaseAdmin.storage
            .from('content-media')
            .upload(uniqueFilename, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: true
            });

          if (!error && data) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from('content-media')
              .getPublicUrl(uniqueFilename);
            publicStoragePath = publicUrlData.publicUrl;
          }
        } catch (sbStorageErr) {
          console.warn('[Supabase Storage note]: Falling back to local storage', sbStorageErr.message);
        }
      }

      // 2. Fallback to local uploads directory
      if (!publicStoragePath) {
        const localFilePath = path.join(uploadDir, uniqueFilename);
        fs.writeFileSync(localFilePath, req.file.buffer);
        publicStoragePath = `/uploads/${uniqueFilename}`;
      }

      // 3. Record in media table
      const mediaRecord = await db.createMedia({
        filename: originalName,
        storage_path: publicStoragePath,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        uploaded_by: req.user.id
      });

      await db.logActivity({
        user_id: req.user.id,
        action: 'MEDIA_UPLOAD',
        target_type: 'media',
        target_id: mediaRecord.id,
        description: `${req.user.full_name} uploaded media file: "${mediaRecord.filename}" (${(req.file.size / 1024).toFixed(1)} KB)`
      });

      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully.',
        media: mediaRecord
      });
    } catch (error) {
      console.error('Media upload error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to process media upload.'
      });
    }
  });
});

// DELETE /api/media/:id - Delete media when safe
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const media = await db.getMediaById(id);
    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found.' });
    }

    const deleted = await db.deleteMedia(id, req.user);

    // If local file, delete from disk
    if (deleted.storage_path && deleted.storage_path.startsWith('/uploads/')) {
      const filename = path.basename(deleted.storage_path);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.logActivity({
      user_id: req.user.id,
      action: 'MEDIA_DELETE',
      target_type: 'media',
      target_id: id,
      description: `${req.user.full_name} deleted media asset "${deleted.filename}".`
    });

    return res.json({
      success: true,
      message: 'Media deleted successfully.',
      media: deleted
    });
  } catch (error) {
    return res.status(403).json({ success: false, error: error.message });
  }
});

export default router;

