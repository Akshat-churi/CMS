-- ==============================================================================
-- ContentPilot AI - Supabase Database Schema (Phase 1)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

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
INSERT INTO public.categories (name, slug, description)
VALUES 
    ('Technology & AI', 'technology-ai', 'Latest trends in software, computing, and machine learning.'),
    ('Product & Design', 'product-design', 'Insights on UI/UX, product strategies, and human-centered design.'),
    ('Business & Startups', 'business-startups', 'Company building, growth, leadership, and operational scale.'),
    ('Community & Events', 'community-events', 'Conferences, workshops, hackathons, and company announcements.')
ON CONFLICT (slug) DO NOTHING;

