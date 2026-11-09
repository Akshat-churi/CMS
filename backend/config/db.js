import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, isSupabaseConfigured } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VERCEL 
  ? path.join('/tmp', 'contentpilot_data') 
  : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'contentpilot.json');

// Ensure data directory exists with serverless fallback
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (dirErr) {
  console.warn('[DB] Read-only filesystem detected, operating in memory:', dirErr.message);
}

// Initial Seed Data generator
const getInitialSeed = () => {
  const adminId = '11111111-1111-4111-8111-111111111111';
  const editorId = '22222222-2222-4222-8222-222222222222';
  const authorId = '33333333-3333-4333-8333-333333333333';

  const defaultPasswordHash = bcrypt.hashSync('Admin@123', 10);
  const editorPasswordHash = bcrypt.hashSync('Editor@123', 10);
  const authorPasswordHash = bcrypt.hashSync('Author@123', 10);

  const catTechId = 'c1111111-1111-4111-8111-111111111111';
  const catDesignId = 'c2222222-2222-4222-8222-222222222222';
  const catBusinessId = 'c3333333-3333-4333-8333-333333333333';
  const catCommunityId = 'c4444444-4444-4444-8444-444444444444';

  const now = new Date().toISOString();

  return {
    profiles: [
      {
        id: adminId,
        full_name: 'Administrator',
        email: 'admin@contentpilot.ai',
        password_hash: defaultPasswordHash,
        role: 'admin',
        is_active: true,
        created_at: now
      },
      {
        id: editorId,
        full_name: 'Senior Editor',
        email: 'editor@contentpilot.ai',
        password_hash: editorPasswordHash,
        role: 'editor',
        is_active: true,
        created_at: now
      },
      {
        id: authorId,
        full_name: 'Staff Author',
        email: 'author@contentpilot.ai',
        password_hash: authorPasswordHash,
        role: 'author',
        is_active: true,
        created_at: now
      }
    ],
    categories: [
      {
        id: catTechId,
        name: 'Technology & AI',
        slug: 'technology-ai',
        description: 'Next-gen computing, cloud engineering, architecture, and developer frameworks.',
        created_at: now
      },
      {
        id: catDesignId,
        name: 'Product & Design',
        slug: 'product-design',
        description: 'User experience design systems, interaction patterns, and editorial strategy.',
        created_at: now
      },
      {
        id: catBusinessId,
        name: 'Business & Startups',
        slug: 'business-startups',
        description: 'Company scaling, venture strategy, operations, and leadership execution.',
        created_at: now
      },
      {
        id: catCommunityId,
        name: 'Community & Events',
        slug: 'community-events',
        description: 'Conferences, workshops, hackathons, and announcements.',
        created_at: now
      }
    ],
    contents: [
      {
        id: 'a1111111-1111-4111-8111-111111111111',
        title: 'Architecting High-Throughput Modern CMS with Node.js and Supabase',
        slug: 'architecting-high-throughput-modern-cms',
        description: 'A deep architectural dive into decoupled content delivery, row-level security, and role-based workflows.',
        body: `<h2>Introduction to Modern CMS Architecture</h2><p>Modern editorial teams require speed, rock-solid security, and flawless collaborative workflows. In this article, we dissect how <strong>ContentPilot AI</strong> combines the power of Express, Supabase PostgreSQL, and React to deliver a dependable CMS without unnecessary external dependencies.</p><h3>Why Decoupled Content Delivery Wins</h3><p>By separating the public content rendering layer from administrative editing, systems gain resilience against traffic spikes. Supabase provides granular Row Level Security (RLS) guaranteeing that drafts and rejected submissions never leak to unauthorized viewers.</p><h3>Role-Based Access Control in Practice</h3><ul><li><strong>Authors:</strong> Draft and submit compelling content for editorial review.</li><li><strong>Editors:</strong> Review, refine, approve, and publish content.</li><li><strong>Administrators:</strong> Govern users, taxonomies, and system integrity.</li></ul><p>ContentPilot exemplifies these architectural patterns cleanly and reliably.</p>`,
        content_type: 'article',
        featured_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        author_id: authorId,
        category_id: catTechId,
        tags: ['Architecture', 'Node.js', 'Supabase', 'Engineering'],
        status: 'published',
        seo_title: 'Architecting High-Throughput Modern CMS | ContentPilot AI',
        meta_description: 'Discover how modern CMS architectures leverage Supabase PostgreSQL, RLS, and Express to ensure resilience and editorial excellence.',
        keywords: 'CMS, Supabase, Node.js, Web Architecture, PostgreSQL',
        published_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: 'a2222222-2222-4222-8222-222222222222',
        title: 'Design Systems for Editorial Teams: Balancing Brand Consistency and Flexibility',
        slug: 'design-systems-for-editorial-teams',
        description: 'How modern media organizations establish typography, responsive hierarchy, and high visual standards.',
        body: `<h2>The Need for Editorial Discipline</h2><p>Design systems are not merely component libraries; they embody an organization's editorial philosophy. When authors and editors collaborate under high velocity, having standardized modular components preserves trust and readability.</p><h3>Readability and Responsive Typographic Hierarchy</h3><p>Good typography respects readers across devices. Fluid scaling, optimal line heights, and clear contrast ratios ensure that complex articles remain accessible and engaging.</p>`,
        content_type: 'article',
        featured_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        author_id: editorId,
        category_id: catDesignId,
        tags: ['Design Systems', 'UI/UX', 'Typography', 'Branding'],
        status: 'published',
        seo_title: 'Design Systems for Editorial Teams | ContentPilot AI',
        meta_description: 'Learn how to build editorial design systems that balance visual consistency with writer flexibility.',
        keywords: 'Design Systems, Editorial, Typography, UI/UX',
        published_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: 'b1111111-1111-4111-8111-111111111111',
        title: 'ContentPilot AI Version 1.0 Launched for Enterprise Editorial Workflows',
        slug: 'contentpilot-ai-version-1-launched',
        description: 'ContentPilot launches its robust Phase 1 core CMS featuring dynamic multi-role publishing and media governance.',
        body: `<h2>Announcing ContentPilot AI 1.0</h2><p>Today marks the official release of ContentPilot AI's comprehensive CMS core. Built strictly to deliver maximum uptime and security, the system provides full CRUD capabilities, audit logging, and role-based permissions.</p><p>Key Highlights:</p><ul><li>Complete separation of editorial drafts and public content.</li><li>Instant preview and full revision history tracking.</li><li>Responsive reader experience across mobile, tablet, and desktop.</li></ul>`,
        content_type: 'news',
        featured_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        author_id: adminId,
        category_id: catTechId,
        tags: ['Release', 'CMS', 'News', 'ContentPilot'],
        status: 'published',
        seo_title: 'ContentPilot AI Version 1.0 Launched | News',
        meta_description: 'Read the official release announcement of ContentPilot AI 1.0 featuring multi-role workflows.',
        keywords: 'News, Release, ContentPilot, Enterprise',
        published_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: 'd1111111-1111-4111-8111-111111111111',
        title: 'Scheduled System Maintenance: Database Performance Optimization',
        slug: 'scheduled-system-maintenance-february',
        description: 'Notice regarding upcoming infrastructure scaling and database indexing maintenance window.',
        body: `<h2>Scheduled Infrastructure Maintenance Notice</h2><p>Please be advised that on Saturday evening at 02:00 UTC, the ContentPilot core database will undergo scheduled indexing and routine performance tuning.</p><p><strong>Expected Downtime:</strong> Under 5 minutes. The public website will remain accessible via edge caching.</p>`,
        content_type: 'announcement',
        featured_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        author_id: adminId,
        category_id: catBusinessId,
        tags: ['Maintenance', 'System Update', 'Notice'],
        status: 'published',
        seo_title: 'Scheduled System Maintenance Notice | ContentPilot AI',
        meta_description: 'Notice regarding upcoming routine maintenance for database optimization.',
        keywords: 'Maintenance, Announcement, Infrastructure',
        published_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: 'e1111111-1111-4111-8111-111111111111',
        title: 'Global Tech & Publishing Summit 2026',
        slug: 'global-tech-and-publishing-summit-2026',
        description: 'Join industry pioneers, journalists, and engineers for a 2-day conference on future-ready digital publishing.',
        body: `<h2>About the Global Summit</h2><p>The Global Tech & Publishing Summit brings together over 5,000 digital creators, editorial directors, and platform architects. Experience keynote discussions on ethical journalism, decoupled web platforms, and automated workflow pipelines.</p><h3>Event Schedule & Highlights</h3><ul><li><strong>Day 1:</strong> Keynote on Modern CMS Architecture, Panel on Content Governance.</li><li><strong>Day 2:</strong> Technical Workshops on Supabase, React, and Performance Audits.</li></ul><p><strong>Location:</strong> San Francisco Convention Center & Virtual Livestream.<br/><strong>Date:</strong> November 18-19, 2026.</p>`,
        content_type: 'event',
        featured_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        author_id: editorId,
        category_id: catCommunityId,
        tags: ['Conference', 'Summit', 'Community', 'Publishing'],
        status: 'published',
        seo_title: 'Global Tech & Publishing Summit 2026 | Events',
        meta_description: 'Register for the premier annual conference on digital publishing, web engineering, and content strategy.',
        keywords: 'Summit, Conference, Event, Web Tech',
        published_at: now,
        created_at: now,
        updated_at: now
      }
    ],
    content_versions: [],
    media: [
      {
        id: 'm-sample-1',
        filename: 'code-editor-hero.jpg',
        storage_path: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        file_size: 184520,
        uploaded_by: adminId,
        created_at: now
      },
      {
        id: 'm-sample-2',
        filename: 'design-workspace.jpg',
        storage_path: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        file_size: 215400,
        uploaded_by: editorId,
        created_at: now
      }
    ],
    activity_logs: [
      {
        id: 'log-1',
        user_id: adminId,
        action: 'SYSTEM_INIT',
        target_type: 'system',
        target_id: 'root',
        description: 'ContentPilot AI core initialized with initial seed dataset.',
        created_at: now
      }
    ]
  };
};

class DatabaseManager {
  constructor() {
    this.memoryData = null;
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryData = JSON.parse(raw);
      } catch (err) {
        console.error('[DB] Error parsing existing db file. Re-initializing seed.', err);
        this.memoryData = getInitialSeed();
        this.save();
      }
    } else {
      console.log('[DB] No local db file found. Generating initial seed dataset.');
      this.memoryData = getInitialSeed();
      this.save();
    }

    // Try seeding remote Supabase if tables exist but are empty
    if (isSupabaseConfigured && supabaseAdmin) {
      this.seedSupabaseIfEmpty().catch(() => {});
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  async seedSupabaseIfEmpty() {
    if (!isSupabaseConfigured || !supabaseAdmin) return;
    try {
      // 1. Check profiles
      const { data: profs, error: profErr } = await supabaseAdmin.from('profiles').select('id').limit(1);
      if (!profErr && profs && profs.length === 0) {
        console.log('[Supabase] Remote profiles table is empty. Seeding initial accounts...');
        for (const p of this.memoryData.profiles) {
          await supabaseAdmin.from('profiles').upsert({
            id: p.id,
            full_name: p.full_name,
            email: p.email.toLowerCase().trim(),
            password_hash: p.password_hash,
            role: p.role,
            is_active: p.is_active
          }, { onConflict: 'id' });
        }
      }

      // 2. Check categories
      const { data: cats, error: catErr } = await supabaseAdmin.from('categories').select('id').limit(1);
      if (!catErr && cats && cats.length === 0) {
        console.log('[Supabase] Remote categories table is empty. Seeding default categories...');
        for (const c of this.memoryData.categories) {
          await supabaseAdmin.from('categories').upsert({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || ''
          }, { onConflict: 'id' });
        }
      }

      // 3. Check contents
      const { data: cnts, error: cntErr } = await supabaseAdmin.from('contents').select('id').limit(1);
      if (!cntErr && cnts && cnts.length === 0) {
        console.log('[Supabase] Remote contents table is empty. Seeding default articles...');
        for (const c of this.memoryData.contents) {
          await supabaseAdmin.from('contents').upsert({
            id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description || '',
            body: c.body || '',
            content_type: c.content_type || 'article',
            featured_image: c.featured_image || null,
            author_id: c.author_id,
            category_id: c.category_id || null,
            tags: Array.isArray(c.tags) ? c.tags : [],
            status: c.status || 'published',
            rejection_reason: c.rejection_reason || null,
            seo_title: c.seo_title || c.title,
            meta_description: c.meta_description || c.description || '',
            keywords: c.keywords || '',
            published_at: c.published_at || new Date().toISOString(),
            created_at: c.created_at || new Date().toISOString(),
            updated_at: c.updated_at || new Date().toISOString()
          }, { onConflict: 'id' });
        }
      }
    } catch (e) {
      // Ignored if schema not executed yet
    }
  }

  // Pre-sync foreign key dependencies to ensure foreign keys never fail
  async ensureProfileInSupabase(userOrId) {
    if (!isSupabaseConfigured || !supabaseAdmin || !userOrId) return;
    try {
      const id = typeof userOrId === 'string' ? userOrId : userOrId.id;
      if (!id) return;
      const local = this.memoryData.profiles.find(p => p.id === id);
      if (!local) return;
      await supabaseAdmin.from('profiles').upsert({
        id: local.id,
        full_name: local.full_name,
        email: local.email.toLowerCase().trim(),
        password_hash: local.password_hash,
        role: local.role,
        is_active: local.is_active
      }, { onConflict: 'id' });
    } catch (e) {}
  }

  async ensureCategoryInSupabase(catId) {
    if (!isSupabaseConfigured || !supabaseAdmin || !catId) return;
    try {
      const local = this.memoryData.categories.find(c => c.id === catId);
      if (!local) return;
      await supabaseAdmin.from('categories').upsert({
        id: local.id,
        name: local.name,
        slug: local.slug,
        description: local.description || ''
      }, { onConflict: 'id' });
    } catch (e) {}
  }

  // --- PROFILES ---
  async getProfileById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
        if (!error && data) {
          const idx = this.memoryData.profiles.findIndex(p => p.id === id);
          if (idx !== -1) {
            this.memoryData.profiles[idx] = { ...this.memoryData.profiles[idx], ...data };
          } else {
            this.memoryData.profiles.push(data);
          }
          return data;
        }
      } catch (e) {}
    }
    return this.memoryData.profiles.find(p => p.id === id) || null;
  }

  async getProfileByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('email', cleanEmail).single();
        if (!error && data) {
          const idx = this.memoryData.profiles.findIndex(p => p.email.toLowerCase() === cleanEmail);
          if (idx !== -1) {
            this.memoryData.profiles[idx] = { ...this.memoryData.profiles[idx], ...data };
          } else {
            this.memoryData.profiles.push(data);
          }
          return data;
        }
      } catch (e) {}
    }
    return this.memoryData.profiles.find(p => p.email.toLowerCase() === cleanEmail) || null;
  }

  async getAllProfiles({ search, role, page = 1, limit = 50 } = {}) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });
        if (role && role !== 'all') {
          query = query.eq('role', role);
        }
        if (search) {
          const q = search.trim();
          query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
        }
        query = query.order('created_at', { ascending: false });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          const paginated = data.map(p => {
            const { password_hash, ...safe } = p;
            return safe;
          });
          const total = typeof count === 'number' ? count : paginated.length;
          return { profiles: paginated, total };
        }
      } catch (e) {}
    }

    let list = [...this.memoryData.profiles];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    }
    if (role && role !== 'all') {
      list = list.filter(p => p.role === role);
    }
    const total = list.length;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit).map(p => {
      const { password_hash, ...safe } = p;
      return safe;
    });
    return { profiles: paginated, total };
  }

  async createProfile({ id, full_name, email, password, role = 'author', is_active = true }) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await this.getProfileByEmail(cleanEmail);
    if (existing) {
      throw new Error('A user with this email already exists.');
    }

    const newId = id || uuidv4();
    const password_hash = password ? bcrypt.hashSync(password, 10) : null;
    const now = new Date().toISOString();

    const newProfile = {
      id: newId,
      full_name,
      email: cleanEmail,
      password_hash,
      role,
      is_active,
      created_at: now
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('profiles').insert([{
          id: newId,
          full_name,
          email: cleanEmail,
          password_hash,
          role,
          is_active
        }]);
      } catch (e) {
        console.warn('[Supabase] Warning syncing profile to Supabase:', e.message);
      }
    }

    this.memoryData.profiles.push(newProfile);
    this.save();

    const { password_hash: _, ...safe } = newProfile;
    return safe;
  }

  async updateProfile(id, updates) {
    const profile = await this.getProfileById(id);
    if (!profile) throw new Error('User profile not found.');

    // Protect last active administrator check
    if (profile.role === 'admin' && ((updates.role && updates.role !== 'admin') || updates.is_active === false)) {
      const activeAdmins = this.memoryData.profiles.filter(p => p.role === 'admin' && p.is_active === true && p.id !== id);
      if (activeAdmins.length === 0) {
        throw new Error('Operation aborted: You cannot demote or deactivate the last remaining active administrator.');
      }
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { password, ...safeUpdates } = updates;
        if (password) {
          safeUpdates.password_hash = bcrypt.hashSync(password, 10);
        }
        await supabaseAdmin.from('profiles').update(safeUpdates).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Profile update sync note:', e.message);
      }
    }

    const memProfile = this.memoryData.profiles.find(p => p.id === id);
    if (memProfile) {
      Object.assign(memProfile, updates);
      if (updates.password) {
        memProfile.password_hash = bcrypt.hashSync(updates.password, 10);
      }
    }
    this.save();
    const { password_hash, ...safe } = memProfile || { ...profile, ...updates };
    return safe;
  }

  // --- CATEGORIES ---
  async getAllCategories() {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: categories, error } = await supabaseAdmin.from('categories').select('*').order('name');
        if (!error && categories) {
          const { data: contentsData } = await supabaseAdmin.from('contents').select('category_id').eq('status', 'published');
          const counts = {};
          if (contentsData) {
            for (const row of contentsData) {
              if (row.category_id) counts[row.category_id] = (counts[row.category_id] || 0) + 1;
            }
          }
          for (const cat of categories) {
            const idx = this.memoryData.categories.findIndex(c => c.id === cat.id);
            if (idx !== -1) {
              this.memoryData.categories[idx] = { ...this.memoryData.categories[idx], ...cat };
            } else {
              this.memoryData.categories.push(cat);
            }
          }
          return categories.map(c => ({
            ...c,
            content_count: counts[c.id] || 0
          }));
        }
      } catch (e) {}
    }

    const counts = {};
    for (const content of this.memoryData.contents) {
      if (content.category_id && content.status === 'published') {
        counts[content.category_id] = (counts[content.category_id] || 0) + 1;
      }
    }
    return this.memoryData.categories.map(c => ({
      ...c,
      content_count: counts[c.id] || 0
    }));
  }

  async getCategoryById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('categories').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    return this.memoryData.categories.find(c => c.id === id) || null;
  }

  async getCategoryBySlug(slug) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('categories').select('*').eq('slug', slug).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    return this.memoryData.categories.find(c => c.slug === slug) || null;
  }

  async createCategory({ name, slug, description }) {
    const existing = this.memoryData.categories.find(c => c.slug === slug || c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error('A category with this name or slug already exists.');
    }
    const cat = {
      id: uuidv4(),
      name,
      slug,
      description: description || '',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('categories').insert([cat]);
      } catch (e) {
        console.warn('[Supabase] Warning inserting category:', e.message);
      }
    }

    this.memoryData.categories.push(cat);
    this.save();
    return cat;
  }

  async updateCategory(id, { name, slug, description }) {
    const cat = await this.getCategoryById(id);
    if (!cat) throw new Error('Category not found.');
    if (slug && slug !== cat.slug) {
      const duplicate = this.memoryData.categories.find(c => c.slug === slug && c.id !== id);
      if (duplicate) throw new Error('A category with this slug already exists.');
    }

    const updates = {};
    if (name) updates.name = name;
    if (slug) updates.slug = slug;
    if (description !== undefined) updates.description = description;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('categories').update(updates).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Category update sync note:', e.message);
      }
    }

    const memCat = this.memoryData.categories.find(c => c.id === id);
    if (memCat) Object.assign(memCat, updates);
    this.save();
    return memCat || { ...cat, ...updates };
  }

  async deleteCategory(id) {
    const cat = await this.getCategoryById(id);
    if (!cat) throw new Error('Category not found.');

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('contents').update({ category_id: null }).eq('category_id', id);
        await supabaseAdmin.from('categories').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Category delete sync note:', e.message);
      }
    }

    this.memoryData.contents.forEach(c => {
      if (c.category_id === id) c.category_id = null;
    });
    const index = this.memoryData.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.memoryData.categories.splice(index, 1);
    }
    this.save();
    return cat;
  }

  // --- CONTENTS POPULATION ---
  populateContent(content) {
    if (!content) return null;
    const author = this.memoryData.profiles.find(p => p.id === content.author_id);
    const category = this.memoryData.categories.find(c => c.id === content.category_id);
    return {
      ...content,
      author: author 
        ? { id: author.id, full_name: author.full_name, email: author.email, role: author.role } 
        : (content.author || null),
      category: category 
        ? { id: category.id, name: category.name, slug: category.slug } 
        : (content.category || null)
    };
  }

  async populateContentAsync(content) {
    if (!content) return null;
    let author = this.memoryData.profiles.find(p => p.id === content.author_id);
    if (!author && isSupabaseConfigured && supabaseAdmin && content.author_id) {
      try {
        const { data, error } = await supabaseAdmin.from('profiles').select('id, full_name, email, role').eq('id', content.author_id).single();
        if (!error && data) {
          author = data;
          if (!this.memoryData.profiles.some(p => p.id === data.id)) {
            this.memoryData.profiles.push(data);
          }
        }
      } catch (e) {}
    }

    let category = this.memoryData.categories.find(c => c.id === content.category_id);
    if (!category && isSupabaseConfigured && supabaseAdmin && content.category_id) {
      try {
        const { data, error } = await supabaseAdmin.from('categories').select('id, name, slug').eq('id', content.category_id).single();
        if (!error && data) {
          category = data;
          if (!this.memoryData.categories.some(c => c.id === data.id)) {
            this.memoryData.categories.push(data);
          }
        }
      } catch (e) {}
    }

    return {
      ...content,
      author: author 
        ? { id: author.id, full_name: author.full_name, email: author.email, role: author.role } 
        : (content.author || null),
      category: category 
        ? { id: category.id, name: category.name, slug: category.slug } 
        : (content.category || null)
    };
  }

  // --- CONTENTS ---
  async getPublishedContents({ type, categoryId, search, tag, page = 1, limit = 10, sort = 'newest' } = {}) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('contents').select('*', { count: 'exact' }).eq('status', 'published');
        if (type && type !== 'all') {
          query = query.eq('content_type', type);
        }
        if (categoryId && categoryId !== 'all') {
          query = query.eq('category_id', categoryId);
        }
        if (tag) {
          query = query.contains('tags', [tag]);
        }
        if (search) {
          const q = search.trim();
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,body.ilike.%${q}%`);
        }
        query = query.order('published_at', { ascending: sort === 'oldest' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          const items = await Promise.all(data.map(c => this.populateContentAsync(c)));
          const total = typeof count === 'number' ? count : items.length;
          return { contents: items, total, totalPages: Math.ceil(total / limit) || 1, page };
        }
      } catch (e) {}
    }

    let list = this.memoryData.contents.filter(c => c.status === 'published');
    if (type && type !== 'all') {
      list = list.filter(c => c.content_type === type);
    }
    if (categoryId && categoryId !== 'all') {
      list = list.filter(c => c.category_id === categoryId);
    }
    if (tag) {
      const tagLower = tag.toLowerCase();
      list = list.filter(c => Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase() === tagLower));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.body && c.body.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map(c => this.populateContent(c));
    return { contents: items, total, totalPages: Math.ceil(total / limit) || 1, page };
  }

  async getContentsForManagement({ status, type, categoryId, search, user, page = 1, limit = 20 } = {}) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('contents').select('*', { count: 'exact' });
        if (user.role === 'author') {
          query = query.eq('author_id', user.id);
        }
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }
        if (type && type !== 'all') {
          query = query.eq('content_type', type);
        }
        if (categoryId && categoryId !== 'all') {
          query = query.eq('category_id', categoryId);
        }
        if (search) {
          const q = search.trim();
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
        }
        query = query.order('updated_at', { ascending: false });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          const items = await Promise.all(data.map(c => this.populateContentAsync(c)));
          const total = typeof count === 'number' ? count : items.length;
          return { contents: items, total, totalPages: Math.ceil(total / limit) || 1, page };
        }
      } catch (e) {}
    }

    let list = [...this.memoryData.contents];
    if (user.role === 'author') {
      list = list.filter(c => c.author_id === user.id);
    }
    if (status && status !== 'all') {
      list = list.filter(c => c.status === status);
    }
    if (type && type !== 'all') {
      list = list.filter(c => c.content_type === type);
    }
    if (categoryId && categoryId !== 'all') {
      list = list.filter(c => c.category_id === categoryId);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map(c => this.populateContent(c));
    return { contents: items, total, totalPages: Math.ceil(total / limit) || 1, page };
  }

  async getContentById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('contents').select('*').eq('id', id).single();
        if (!error && data) {
          return await this.populateContentAsync(data);
        }
      } catch (e) {}
    }
    const item = this.memoryData.contents.find(c => c.id === id);
    if (!item) return null;
    return this.populateContent(item);
  }

  async getContentBySlug(slug) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('contents').select('*').eq('slug', slug).single();
        if (!error && data) {
          return await this.populateContentAsync(data);
        }
      } catch (e) {}
    }
    const item = this.memoryData.contents.find(c => c.slug === slug);
    if (!item) return null;
    return this.populateContent(item);
  }

  async createContent(contentData, user) {
    let status = 'draft';
    if (user.role === 'admin' || user.role === 'editor') {
      if (contentData.status && ['draft', 'published', 'pending_review'].includes(contentData.status)) {
        status = contentData.status;
      }
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    let slug = contentData.slug;
    const existingSlug = this.memoryData.contents.find(c => c.slug === slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newContent = {
      id,
      title: contentData.title,
      slug,
      description: contentData.description || '',
      body: contentData.body || '',
      content_type: contentData.content_type || 'article',
      featured_image: contentData.featured_image || null,
      author_id: user.id,
      category_id: contentData.category_id || null,
      tags: Array.isArray(contentData.tags) ? contentData.tags : [],
      status,
      rejection_reason: null,
      seo_title: contentData.seo_title || contentData.title,
      meta_description: contentData.meta_description || contentData.description || '',
      keywords: contentData.keywords || '',
      published_at: status === 'published' ? now : null,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await this.ensureProfileInSupabase(user);
        if (contentData.category_id) {
          await this.ensureCategoryInSupabase(contentData.category_id);
        }
        await supabaseAdmin.from('contents').insert([newContent]);
      } catch (e) {
        console.warn('[Supabase] Content create sync note:', e.message);
      }
    }

    this.memoryData.contents.unshift(newContent);
    this.save();
    return this.populateContent(newContent);
  }

  async updateContent(id, updates, user) {
    let content = this.memoryData.contents.find(c => c.id === id);
    if (!content && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('contents').select('*').eq('id', id).single();
        if (!error && data) {
          content = data;
          this.memoryData.contents.unshift(content);
        }
      } catch (e) {}
    }
    if (!content) throw new Error('Content not found.');

    // RBAC check
    if (user.role === 'author') {
      if (content.author_id !== user.id) {
        throw new Error('Forbidden: You can only edit your own content.');
      }
      if (content.status === 'published') {
        throw new Error('Forbidden: Published content cannot be edited directly by authors. Contact an editor.');
      }
      if (updates.status && updates.status === 'published') {
        throw new Error('Forbidden: Authors are not permitted to publish content directly.');
      }
    }

    // Save previous version in content_versions if title or body changed
    if ((updates.title && updates.title !== content.title) || (updates.body && updates.body !== content.body)) {
      const currentVersions = this.memoryData.content_versions.filter(v => v.content_id === id);
      const versionNum = currentVersions.length + 1;
      const versionRecord = {
        id: uuidv4(),
        content_id: id,
        edited_by: user.id,
        previous_title: content.title,
        previous_body: content.body,
        version_number: versionNum,
        created_at: new Date().toISOString()
      };
      this.memoryData.content_versions.unshift(versionRecord);
      if (isSupabaseConfigured && supabaseAdmin) {
        try {
          await this.ensureProfileInSupabase(user);
          await supabaseAdmin.from('content_versions').insert([versionRecord]);
        } catch (e) {
          console.warn('[Supabase] Version record save note:', e.message);
        }
      }
    }

    // Handle slug change uniqueness
    if (updates.slug && updates.slug !== content.slug) {
      const duplicate = this.memoryData.contents.find(c => c.slug === updates.slug && c.id !== id);
      if (duplicate) {
        updates.slug = `${updates.slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Handle publication timestamp
    if (updates.status === 'published' && content.status !== 'published') {
      updates.published_at = updates.published_at || new Date().toISOString();
      updates.rejection_reason = null;
    }

    updates.updated_at = new Date().toISOString();

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        if (updates.category_id) {
          await this.ensureCategoryInSupabase(updates.category_id);
        }
        await supabaseAdmin.from('contents').update(updates).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Content update sync note:', e.message);
      }
    }

    Object.assign(content, updates);
    this.save();
    return this.populateContent(content);
  }

  async deleteContent(id, user) {
    let index = this.memoryData.contents.findIndex(c => c.id === id);
    let content = index !== -1 ? this.memoryData.contents[index] : null;

    if (!content && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('contents').select('*').eq('id', id).single();
        if (!error && data) content = data;
      } catch (e) {}
    }

    if (!content) throw new Error('Content not found.');

    // RBAC check: Authors can only delete their own drafts
    if (user.role === 'author') {
      if (content.author_id !== user.id) {
        throw new Error('Forbidden: You can only delete your own content.');
      }
      if (content.status !== 'draft') {
        throw new Error('Forbidden: Authors can only delete content with status "draft".');
      }
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('content_versions').delete().eq('content_id', id);
        await supabaseAdmin.from('contents').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Content delete sync note:', e.message);
      }
    }

    if (index !== -1) {
      this.memoryData.contents.splice(index, 1);
    }
    this.save();
    return content;
  }

  // --- CONTENT VERSIONS ---
  async getContentVersions(contentId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('content_versions')
          .select('*')
          .eq('content_id', contentId)
          .order('version_number', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(v => {
            const editor = this.memoryData.profiles.find(p => p.id === v.edited_by);
            return {
              ...v,
              editor: editor ? { id: editor.id, full_name: editor.full_name, email: editor.email } : null
            };
          });
        }
      } catch (e) {}
    }

    const versions = this.memoryData.content_versions
      .filter(v => v.content_id === contentId)
      .sort((a, b) => b.version_number - a.version_number);

    return versions.map(v => {
      const editor = this.memoryData.profiles.find(p => p.id === v.edited_by);
      return {
        ...v,
        editor: editor ? { id: editor.id, full_name: editor.full_name, email: editor.email } : null
      };
    });
  }

  // --- MEDIA ---
  async getAllMedia({ page = 1, limit = 50 } = {}) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, count, error } = await supabaseAdmin.from('media')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        if (!error && data) {
          const items = data.map(m => {
            const uploader = this.memoryData.profiles.find(p => p.id === m.uploaded_by);
            return {
              ...m,
              uploader: uploader ? { id: uploader.id, full_name: uploader.full_name } : null
            };
          });
          return { media: items, total: count || items.length };
        }
      } catch (e) {}
    }

    const total = this.memoryData.media.length;
    const start = (page - 1) * limit;
    const items = this.memoryData.media
      .slice(start, start + limit)
      .map(m => {
        const uploader = this.memoryData.profiles.find(p => p.id === m.uploaded_by);
        return {
          ...m,
          uploader: uploader ? { id: uploader.id, full_name: uploader.full_name } : null
        };
      });
    return { media: items, total };
  }

  async getMediaById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('media').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    return this.memoryData.media.find(m => m.id === id) || null;
  }

  async createMedia({ filename, storage_path, mime_type, file_size, uploaded_by }) {
    const item = {
      id: uuidv4(),
      filename,
      storage_path,
      mime_type,
      file_size,
      uploaded_by,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        if (uploaded_by) await this.ensureProfileInSupabase(uploaded_by);
        await supabaseAdmin.from('media').insert([item]);
      } catch (e) {
        console.warn('[Supabase] Media insert note:', e.message);
      }
    }

    this.memoryData.media.unshift(item);
    this.save();
    return item;
  }

  async deleteMedia(id, user) {
    const media = await this.getMediaById(id);
    if (!media) throw new Error('Media asset not found.');

    if (user.role === 'author' && media.uploaded_by !== user.id) {
      throw new Error('Forbidden: You can only delete your own uploaded media.');
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('media').delete().eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Media delete note:', e.message);
      }
    }

    const index = this.memoryData.media.findIndex(m => m.id === id);
    if (index !== -1) {
      this.memoryData.media.splice(index, 1);
    }
    this.save();
    return media;
  }

  // --- ACTIVITY LOGS ---
  async logActivity({ user_id, action, target_type, target_id, description }) {
    const log = {
      id: uuidv4(),
      user_id: user_id || null,
      action,
      target_type: target_type || null,
      target_id: target_id ? String(target_id) : null,
      description,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        if (user_id) await this.ensureProfileInSupabase(user_id);
        await supabaseAdmin.from('activity_logs').insert([log]);
      } catch (e) {
        // Silently skip if table not created
      }
    }

    this.memoryData.activity_logs.unshift(log);
    if (this.memoryData.activity_logs.length > 1000) {
      this.memoryData.activity_logs.pop();
    }
    this.save();
    return log;
  }

  async getActivityLogs({ page = 1, limit = 30, action, userId } = {}) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('activity_logs').select('*', { count: 'exact' });
        if (action && action !== 'all') {
          query = query.eq('action', action);
        }
        if (userId && userId !== 'all') {
          query = query.eq('user_id', userId);
        }
        query = query.order('created_at', { ascending: false });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          const items = data.map(l => {
            const user = this.memoryData.profiles.find(p => p.id === l.user_id);
            return {
              ...l,
              user: user ? { id: user.id, full_name: user.full_name, email: user.email, role: user.role } : null
            };
          });
          const total = typeof count === 'number' ? count : items.length;
          return { logs: items, total, totalPages: Math.ceil(total / limit) || 1, page };
        }
      } catch (e) {}
    }

    let list = [...this.memoryData.activity_logs];
    if (action && action !== 'all') {
      list = list.filter(l => l.action === action);
    }
    if (userId && userId !== 'all') {
      list = list.filter(l => l.user_id === userId);
    }
    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map(l => {
      const user = this.memoryData.profiles.find(p => p.id === l.user_id);
      return {
        ...l,
        user: user ? { id: user.id, full_name: user.full_name, email: user.email, role: user.role } : null
      };
    });
    return { logs: items, total, totalPages: Math.ceil(total / limit) || 1, page };
  }

  // --- DASHBOARD STATS ---
  async getDashboardStats(user) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const isAuthor = user.role === 'author';
        let contentsQuery = supabaseAdmin.from('contents').select('id, status, content_type, author_id');
        if (isAuthor) {
          contentsQuery = contentsQuery.eq('author_id', user.id);
        }
        const { data: contentsData, error: cntErr } = await contentsQuery;

        if (!cntErr && contentsData) {
          const totalContent = contentsData.length;
          const publishedCount = contentsData.filter(c => c.status === 'published').length;
          const draftsCount = contentsData.filter(c => c.status === 'draft').length;
          const pendingCount = contentsData.filter(c => c.status === 'pending_review').length;
          const rejectedCount = contentsData.filter(c => c.status === 'rejected').length;

          const byType = {
            article: contentsData.filter(c => c.content_type === 'article').length,
            news: contentsData.filter(c => c.content_type === 'news').length,
            announcement: contentsData.filter(c => c.content_type === 'announcement').length,
            event: contentsData.filter(c => c.content_type === 'event').length
          };

          const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
          const { count: activeUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);

          let recentQuery = supabaseAdmin.from('contents').select('*').order('updated_at', { ascending: false }).limit(5);
          if (isAuthor) recentQuery = recentQuery.eq('author_id', user.id);
          const { data: recentContents } = await recentQuery;
          const recentlyUpdated = recentContents ? await Promise.all(recentContents.map(c => this.populateContentAsync(c))) : [];

          const { data: recentLogsData } = await supabaseAdmin.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8);
          const recentActivity = (recentLogsData || []).map(l => {
            const u = this.memoryData.profiles.find(p => p.id === l.user_id);
            return {
              ...l,
              user: u ? { id: u.id, full_name: u.full_name, email: u.email, role: u.role } : null
            };
          });

          return {
            stats: {
              totalContent,
              publishedCount,
              draftsCount,
              pendingCount,
              rejectedCount,
              totalUsers: totalUsers || this.memoryData.profiles.length,
              activeUsers: activeUsers || this.memoryData.profiles.filter(p => p.is_active).length
            },
            byType,
            recentlyUpdated,
            recentActivity
          };
        }
      } catch (e) {}
    }

    const contents = this.memoryData.contents;
    const isAuthor = user.role === 'author';
    const relevantContents = isAuthor ? contents.filter(c => c.author_id === user.id) : contents;

    const totalContent = relevantContents.length;
    const publishedCount = relevantContents.filter(c => c.status === 'published').length;
    const draftsCount = relevantContents.filter(c => c.status === 'draft').length;
    const pendingCount = relevantContents.filter(c => c.status === 'pending_review').length;
    const rejectedCount = relevantContents.filter(c => c.status === 'rejected').length;

    const totalUsers = this.memoryData.profiles.length;
    const activeUsers = this.memoryData.profiles.filter(p => p.is_active).length;

    const byType = {
      article: relevantContents.filter(c => c.content_type === 'article').length,
      news: relevantContents.filter(c => c.content_type === 'news').length,
      announcement: relevantContents.filter(c => c.content_type === 'announcement').length,
      event: relevantContents.filter(c => c.content_type === 'event').length
    };

    const recentlyUpdated = [...relevantContents]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 5)
      .map(c => this.populateContent(c));

    const recentActivity = [...this.memoryData.activity_logs]
      .slice(0, 8)
      .map(l => {
        const u = this.memoryData.profiles.find(p => p.id === l.user_id);
        return {
          ...l,
          user: u ? { id: u.id, full_name: u.full_name, email: u.email, role: u.role } : null
        };
      });

    return {
      stats: {
        totalContent,
        publishedCount,
        draftsCount,
        pendingCount,
        rejectedCount,
        totalUsers,
        activeUsers
      },
      byType,
      recentlyUpdated,
      recentActivity
    };
  }
}

export const db = new DatabaseManager();

