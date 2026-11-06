import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder first, fallback to root folder
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { isSupabaseConfigured } from './config/supabase.js';
import { db } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import contentRoutes from './routes/content.routes.js';
import categoryRoutes from './routes/category.routes.js';
import mediaRoutes from './routes/media.routes.js';
import userRoutes from './routes/user.routes.js';
import activityRoutes from './routes/activity.routes.js';
import statsRoutes from './routes/stats.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { aiService } from './services/ai.service.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Media File Serving
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    system: 'ContentPilot AI - Phase 2 AI Integrated CMS',
    version: '2.0.0',
    mode: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Embedded High-Performance Engine',
    ai: aiService.getStatus(),
    timestamp: new Date().toISOString()
  });
});

// API Routes - Support both with and without /api prefix for seamless Vercel / serverless routing
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/contents', '/contents'], contentRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/media', '/media'], mediaRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/activity-logs', '/activity-logs'], activityRoutes);
app.use(['/api/stats', '/stats'], statsRoutes);
app.use(['/api/ai', '/ai'], aiRoutes);

// Public Contact Form Submission Endpoint
app.post(['/api/contact', '/contact'], async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required.'
      });
    }

    await db.logActivity({
      user_id: null,
      action: 'CONTACT_INQUIRY',
      target_type: 'contact',
      target_id: null,
      description: `Inquiry from ${name.trim()} (${email.trim()}): "${(subject || 'General Inquiry').trim().slice(0, 50)}"`
    });

    return res.json({
      success: true,
      message: 'Thank you! Your message has been received by our editorial desk.'
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process inquiry. Please try again later.'
    });
  }
});

// 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 ContentPilot AI Backend Server running on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Mode: ${isSupabaseConfigured ? 'Remote Supabase' : 'Local Storage Engine'}`);
    console.log(`   Phase: Phase 1 (Complete Traditional CMS)`);
    console.log(`=================================================\n`);
  });
}

export default app;
