-- ==============================================================================
-- ContentPilot AI - Supabase Database Schema (Phase 1)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users or direct profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CONTENTS TABLE
CREATE TABLE IF NOT EXISTS public.contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    body TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'news', 'announcement', 'event')),
    featured_image TEXT,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
    rejection_reason TEXT,
    seo_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CONTENT VERSIONS TABLE (Revision History)
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
    edited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    previous_title TEXT NOT NULL,
    previous_body TEXT NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_contents_status ON public.contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_author_id ON public.contents(author_id);
CREATE INDEX IF NOT EXISTS idx_contents_category_id ON public.contents(category_id);
CREATE INDEX IF NOT EXISTS idx_contents_content_type ON public.contents(content_type);
CREATE INDEX IF NOT EXISTS idx_contents_slug ON public.contents(slug);
CREATE INDEX IF NOT EXISTS idx_contents_published_at ON public.contents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON public.content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Automatically update updated_at timestamp on content change
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contents_modtime ON public.contents;
CREATE TRIGGER trigger_update_contents_modtime
    BEFORE UPDATE ON public.contents
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Function to handle new user registration in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'author'),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent removing the last active administrator
CREATE OR REPLACE FUNCTION public.check_last_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    IF (OLD.role = 'admin' AND (NEW.role != 'admin' OR NEW.is_active = false)) THEN
        SELECT COUNT(*) INTO admin_count
        FROM public.profiles
        WHERE role = 'admin' AND is_active = true AND id != OLD.id;
        
        IF admin_count < 1 THEN
            RAISE EXCEPTION 'Cannot demote or deactivate the last active administrator.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protect_last_admin ON public.profiles;
CREATE TRIGGER trigger_protect_last_admin
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_last_admin();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile name"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.current_user_role() = 'admin');

-- Categories Policies
CREATE POLICY "Categories are readable by all"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Editors and Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.current_user_role() IN ('admin', 'editor'));

-- Contents Policies
CREATE POLICY "Published contents are readable by anyone"
    ON public.contents FOR SELECT
    USING (
        status = 'published'
        OR auth.uid() = author_id
        OR public.current_user_role() IN ('admin', 'editor')
    );

CREATE POLICY "Authors can insert draft contents"
    ON public.contents FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND (status = 'draft' OR public.current_user_role() IN ('admin', 'editor'))
    );

CREATE POLICY "Authors can update own drafts and rejected contents"
    ON public.contents FOR UPDATE
    USING (
        (auth.uid() = author_id AND status IN ('draft', 'rejected', 'pending_review'))
        OR public.current_user_role() IN ('admin', 'editor')
    )
    WITH CHECK (
        (auth.uid() = author_id AND (status IN ('draft', 'pending_review')))
        OR public.current_user_role() IN ('admin', 'editor')
    );

CREATE POLICY "Authors can delete own drafts; Admins/Editors can delete any"
    ON public.contents FOR DELETE
    USING (
        (auth.uid() = author_id AND status = 'draft')
        OR public.current_user_role() IN ('admin', 'editor')
    );

-- Media Policies
CREATE POLICY "Media is readable by anyone"
    ON public.media FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can upload media"
    ON public.media FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins, editors, or uploaders can delete media"
    ON public.media FOR DELETE
    USING (
        auth.uid() = uploaded_by
        OR public.current_user_role() IN ('admin', 'editor')
    );

-- Content Versions Policies
CREATE POLICY "Content versions viewable by authors, editors, admins"
    ON public.content_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contents c
            WHERE c.id = content_id
            AND (c.author_id = auth.uid() OR public.current_user_role() IN ('admin', 'editor'))
        )
    );

CREATE POLICY "Content versions insertable by content modifier"
    ON public.content_versions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Activity Logs Policies
CREATE POLICY "Activity logs viewable by Admins and Editors"
    ON public.activity_logs FOR SELECT
    USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Activity logs insertable by authenticated users"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (For Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-media', 'content-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public media access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'content-media');

CREATE POLICY "Authenticated users upload media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'content-media' AND auth.role() = 'authenticated');

CREATE POLICY "Uploaders and Admins can delete media files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'content-media' AND (auth.uid() = owner OR public.current_user_role() IN ('admin', 'editor')));

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
INSERT INTO public.profiles (id, full_name, email, password_hash, role, is_active)
VALUES 
    ('11111111-1111-4111-8111-111111111111', 'Administrator', 'admin@contentpilot.ai', '$2a$10$P85NqYj31zZkVxH5aHwHeeQ5B.3G/p55l1oBwKkC5kP8B7vBwPj.m', 'admin', true),
    ('22222222-2222-4222-8222-222222222222', 'Senior Editor', 'editor@contentpilot.ai', '$2a$10$wE9w2QvL3jK5hD7aZ1kK.eB5b5gZ5l1oBwKkC5kP8B7vBwPj.m', 'editor', true),
    ('33333333-3333-4333-8333-333333333333', 'Staff Author', 'author@contentpilot.ai', '$2a$10$qR7t6Y5u4I3o2P1aZ9kK.eB5b5gZ5l1oBwKkC5kP8B7vBwPj.m', 'author', true)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

INSERT INTO public.categories (id, name, slug, description)
VALUES 
    ('c1111111-1111-4111-8111-111111111111', 'Technology & AI', 'technology-ai', 'Latest trends in software, computing, and machine learning.'),
    ('c2222222-2222-4222-8222-222222222222', 'Product & Design', 'product-design', 'Insights on UI/UX, product strategies, and human-centered design.'),
    ('c3333333-3333-4333-8333-333333333333', 'Business & Startups', 'business-startups', 'Company building, growth, leadership, and operational scale.'),
    ('c4444444-4444-4444-8444-444444444444', 'Community & Events', 'community-events', 'Conferences, workshops, hackathons, and company announcements.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.contents (id, title, slug, description, body, content_type, featured_image, author_id, category_id, tags, status, seo_title, meta_description, keywords, published_at)
VALUES
    (
        'a1111111-1111-4111-8111-111111111111',
        'Architecting High-Throughput Modern CMS with Node.js and Supabase',
        'architecting-high-throughput-modern-cms',
        'A deep architectural dive into decoupled content delivery, row-level security, and role-based workflows.',
        '<h2>Introduction to Modern CMS Architecture</h2><p>Modern editorial teams require speed, rock-solid security, and flawless collaborative workflows. In this article, we dissect how <strong>ContentPilot AI</strong> combines the power of Express, Supabase PostgreSQL, and React to deliver a dependable CMS without unnecessary external dependencies.</p><h3>Why Decoupled Content Delivery Wins</h3><p>By separating the public content rendering layer from administrative editing, systems gain resilience against traffic spikes. Supabase provides granular Row Level Security (RLS) guaranteeing that drafts and rejected submissions never leak to unauthorized viewers.</p><h3>Role-Based Access Control in Practice</h3><ul><li><strong>Authors:</strong> Draft and submit compelling content for editorial review.</li><li><strong>Editors:</strong> Review, refine, approve, and publish content.</li><li><strong>Administrators:</strong> Govern users, taxonomies, and system integrity.</li></ul><p>ContentPilot exemplifies these architectural patterns cleanly and reliably.</p>',
        'article',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        '33333333-3333-4333-8333-333333333333',
        'c1111111-1111-4111-8111-111111111111',
        ARRAY['Architecture', 'Node.js', 'Supabase', 'Engineering'],
        'published',
        'Architecting High-Throughput Modern CMS | ContentPilot AI',
        'Discover how modern CMS architectures leverage Supabase PostgreSQL, RLS, and Express to ensure resilience and editorial excellence.',
        'CMS, Supabase, Node.js, Web Architecture, PostgreSQL',
        now()
    ),
    (
        'a2222222-2222-4222-8222-222222222222',
        'Design Systems for Editorial Teams: Balancing Brand Consistency and Flexibility',
        'design-systems-for-editorial-teams',
        'How modern media organizations establish typography, responsive hierarchy, and high visual standards.',
        '<h2>The Need for Editorial Discipline</h2><p>Design systems are not merely component libraries; they embody an organization editorial philosophy. When authors and editors collaborate under high velocity, having standardized modular components preserves trust and readability.</p><h3>Readability and Responsive Typographic Hierarchy</h3><p>Good typography respects readers across devices. Fluid scaling, optimal line heights, and clear contrast ratios ensure that complex articles remain accessible and engaging.</p>',
        'article',
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        '22222222-2222-4222-8222-222222222222',
        'c2222222-2222-4222-8222-222222222222',
        ARRAY['Design Systems', 'UI/UX', 'Typography', 'Branding'],
        'published',
        'Design Systems for Editorial Teams | ContentPilot AI',
        'Learn how to build editorial design systems that balance visual consistency with writer flexibility.',
        'Design Systems, Editorial, Typography, UI/UX',
        now()
    ),
    (
        'b1111111-1111-4111-8111-111111111111',
        'ContentPilot AI Version 1.0 Launched for Enterprise Editorial Workflows',
        'contentpilot-ai-version-1-launched',
        'ContentPilot launches its robust Phase 1 core CMS featuring dynamic multi-role publishing and media governance.',
        '<h2>Announcing ContentPilot AI 1.0</h2><p>Today marks the official release of ContentPilot AI comprehensive CMS core. Built strictly to deliver maximum uptime and security, the system provides full CRUD capabilities, audit logging, and role-based permissions.</p><p>Key Highlights:</p><ul><li>Complete separation of editorial drafts and public content.</li><li>Instant preview and full revision history tracking.</li><li>Responsive reader experience across mobile, tablet, and desktop.</li></ul>',
        'news',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        '11111111-1111-4111-8111-111111111111',
        'c1111111-1111-4111-8111-111111111111',
        ARRAY['Release', 'CMS', 'News', 'ContentPilot'],
        'published',
        'ContentPilot AI Version 1.0 Launched | News',
        'Read the official release announcement of ContentPilot AI 1.0 featuring multi-role workflows.',
        'News, Release, ContentPilot, Enterprise',
        now()
    ),
    (
        'd1111111-1111-4111-8111-111111111111',
        'Scheduled System Maintenance: Database Performance Optimization',
        'scheduled-system-maintenance-february',
        'Notice regarding upcoming infrastructure scaling and database indexing maintenance window.',
        '<h2>Scheduled Infrastructure Maintenance Notice</h2><p>Please be advised that on Saturday evening at 02:00 UTC, the ContentPilot core database will undergo scheduled indexing and routine performance tuning.</p><p><strong>Expected Downtime:</strong> Under 5 minutes. The public website will remain accessible via edge caching.</p>',
        'announcement',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        '11111111-1111-4111-8111-111111111111',
        'c3333333-3333-4333-8333-333333333333',
        ARRAY['Maintenance', 'System Update', 'Notice'],
        'published',
        'Scheduled System Maintenance Notice | ContentPilot AI',
        'Notice regarding upcoming routine maintenance for database optimization.',
        'Maintenance, Announcement, Infrastructure',
        now()
    ),
    (
        'e1111111-1111-4111-8111-111111111111',
        'Global Tech & Publishing Summit 2026',
        'global-tech-and-publishing-summit-2026',
        'Join industry pioneers, journalists, and engineers for a 2-day conference on future-ready digital publishing.',
        '<h2>About the Global Summit</h2><p>The Global Tech & Publishing Summit brings together over 5,000 digital creators, editorial directors, and platform architects. Experience keynote discussions on ethical journalism, decoupled web platforms, and automated workflow pipelines.</p><h3>Event Schedule & Highlights</h3><ul><li><strong>Day 1:</strong> Keynote on Modern CMS Architecture, Panel on Content Governance.</li><li><strong>Day 2:</strong> Technical Workshops on Supabase, React, and Performance Audits.</li></ul><p><strong>Location:</strong> San Francisco Convention Center & Virtual Livestream.<br/><strong>Date:</strong> November 18-19, 2026.</p>',
        'event',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        '22222222-2222-4222-8222-222222222222',
        'c4444444-4444-4444-8444-444444444444',
        ARRAY['Conference', 'Summit', 'Community', 'Publishing'],
        'published',
        'Global Tech & Publishing Summit 2026 | Events',
        'Register for the premier annual conference on digital publishing, web engineering, and content strategy.',
        'Summit, Conference, Event, Web Tech',
        now()
    )
ON CONFLICT (slug) DO NOTHING;

