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
        id: 'n1111111-1111-4111-8111-111111111111',
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
        id: 'm1111111-1111-4111-8111-111111111111',
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
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  // --- PROFILES ---
  async getProfileById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    return this.memoryData.profiles.find(p => p.id === id) || null;
  }

  async getProfileByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('email', cleanEmail).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    return this.memoryData.profiles.find(p => p.email.toLowerCase() === cleanEmail) || null;
  }

  async getAllProfiles({ search, role, page = 1, limit = 50 } = {}) {
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
    const profile = this.memoryData.profiles.find(p => p.id === id);
    if (!profile) throw new Error('User profile not found.');

    // Protect last active administrator check
    if (profile.role === 'admin' && (updates.role && updates.role !== 'admin' || updates.is_active === false)) {
      const activeAdmins = this.memoryData.profiles.filter(p => p.role === 'admin' && p.is_active === true && p.id !== id);
      if (activeAdmins.length === 0) {
        throw new Error('Operation aborted: You cannot demote or deactivate the last remaining active administrator.');
      }
    }

    Object.assign(profile, updates);

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('profiles').update(updates).eq('id', id);
      } catch (e) {
        console.warn('[Supabase] Profile update sync note:', e.message);
      }
    }

    this.save();
    const { password_hash, ...safe } = profile;
    return safe;
  }

  // --- CATEGORIES ---
  async getAllCategories() {
    // Enrich with count of published posts
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
    return this.memoryData.categories.find(c => c.id === id) || null;
  }

  async getCategoryBySlug(slug) {
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
    this.memoryData.categories.push(cat);
    this.save();
    return cat;
  }

  async updateCategory(id, { name, slug, description }) {
    const cat = this.memoryData.categories.find(c => c.id === id);
    if (!cat) throw new Error('Category not found.');
    if (slug && slug !== cat.slug) {
      const duplicate = this.memoryData.categories.find(c => c.slug === slug && c.id !== id);
      if (duplicate) throw new Error('A category with this slug already exists.');
    }
    if (name) cat.name = name;
    if (slug) cat.slug = slug;
    if (description !== undefined) cat.description = description;
    this.save();
    return cat;
  }

  async deleteCategory(id) {
    const index = this.memoryData.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found.');
    // Unlink from contents
    this.memoryData.contents.forEach(c => {
      if (c.category_id === id) c.category_id = null;
    });
    const [deleted] = this.memoryData.categories.splice(index, 1);
    this.save();
    return deleted;
  }

  // --- CONTENTS ---
  async getPublishedContents({ type, categoryId, search, tag, page = 1, limit = 10, sort = 'newest' } = {}) {
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

    // Sort
    list.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map(c => this.populateContent(c));
    return { contents: items, total, totalPages: Math.ceil(total / limit), page };
  }

  async getContentsForManagement({ status, type, categoryId, search, user, page = 1, limit = 20 } = {}) {
    let list = [...this.memoryData.contents];

    // RBAC filter: Authors only see their own contents
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

    // Sort latest updated first
    list.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map(c => this.populateContent(c));
    return { contents: items, total, totalPages: Math.ceil(total / limit), page };
  }

  async getContentById(id) {
    const item = this.memoryData.contents.find(c => c.id === id);
    if (!item) return null;
    return this.populateContent(item);
  }

  async getContentBySlug(slug) {
    const item = this.memoryData.contents.find(c => c.slug === slug);
    if (!item) return null;
    return this.populateContent(item);
  }

  populateContent(content) {
    const author = this.memoryData.profiles.find(p => p.id === content.author_id);
    const category = this.memoryData.categories.find(c => c.id === content.category_id);
    return {
      ...content,
      author: author ? { id: author.id, full_name: author.full_name, email: author.email, role: author.role } : null,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null
    };
  }

  async createContent(contentData, user) {
    // Determine status: Authors can only create 'draft'
    let status = 'draft';
    if (user.role === 'admin' || user.role === 'editor') {
      if (contentData.status && ['draft', 'published', 'pending_review'].includes(contentData.status)) {
        status = contentData.status;
      }
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    // Verify slug uniqueness
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

    this.memoryData.contents.unshift(newContent);
    this.save();
    return this.populateContent(newContent);
  }

  async updateContent(id, updates, user) {
    const content = this.memoryData.contents.find(c => c.id === id);
    if (!content) throw new Error('Content not found.');

    // RBAC check
    if (user.role === 'author') {
      if (content.author_id !== user.id) {
        throw new Error('Forbidden: You can only edit your own content.');
      }
      if (content.status === 'published') {
        throw new Error('Forbidden: Published content cannot be edited directly by authors. Contact an editor.');
      }
      // If author edits, status can only be 'draft' or 'pending_review'
      if (updates.status && updates.status === 'published') {
        throw new Error('Forbidden: Authors are not permitted to publish content directly.');
      }
    }

    // Save previous version in content_versions if title or body changed
    if ((updates.title && updates.title !== content.title) || (updates.body && updates.body !== content.body)) {
      const currentVersions = this.memoryData.content_versions.filter(v => v.content_id === id);
      const versionNum = currentVersions.length + 1;
      this.memoryData.content_versions.unshift({
        id: uuidv4(),
        content_id: id,
        edited_by: user.id,
        previous_title: content.title,
        previous_body: content.body,
        version_number: versionNum,
        created_at: new Date().toISOString()
      });
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

    Object.assign(content, updates);
    this.save();
    return this.populateContent(content);
  }

  async deleteContent(id, user) {
    const index = this.memoryData.contents.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Content not found.');
    const content = this.memoryData.contents[index];

    // RBAC check: Authors can only delete their own drafts
    if (user.role === 'author') {
      if (content.author_id !== user.id) {
        throw new Error('Forbidden: You can only delete your own content.');
      }
      if (content.status !== 'draft') {
        throw new Error('Forbidden: Authors can only delete content with status "draft".');
      }
    }

    const [deleted] = this.memoryData.contents.splice(index, 1);
    this.save();
    return deleted;
  }

  // --- CONTENT VERSIONS ---
  async getContentVersions(contentId) {
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
    this.memoryData.media.unshift(item);
    this.save();
    return item;
  }

  async deleteMedia(id, user) {
    const index = this.memoryData.media.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Media asset not found.');
    const media = this.memoryData.media[index];

    if (user.role === 'author' && media.uploaded_by !== user.id) {
      throw new Error('Forbidden: You can only delete your own uploaded media.');
    }

    const [deleted] = this.memoryData.media.splice(index, 1);
    this.save();
    return deleted;
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
    this.memoryData.activity_logs.unshift(log);
    // Keep max 1000 logs
    if (this.memoryData.activity_logs.length > 1000) {
      this.memoryData.activity_logs.pop();
    }
    this.save();
    return log;
  }

  async getActivityLogs({ page = 1, limit = 30, action, userId } = {}) {
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
    return { logs: items, total, totalPages: Math.ceil(total / limit), page };
  }

  // --- DASHBOARD STATS ---
  async getDashboardStats(user) {
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

    // Content by type
    const byType = {
      article: relevantContents.filter(c => c.content_type === 'article').length,
      news: relevantContents.filter(c => c.content_type === 'news').length,
      announcement: relevantContents.filter(c => c.content_type === 'announcement').length,
      event: relevantContents.filter(c => c.content_type === 'event').length
    };

    // Recently updated content (up to 5)
    const recentlyUpdated = [...relevantContents]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 5)
      .map(c => this.populateContent(c));

    // Recent activities (up to 8)
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

