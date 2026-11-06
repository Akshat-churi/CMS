import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  Save, 
  Send, 
  CheckCircle, 
  ArrowLeft, 
  Image as ImageIcon, 
  History, 
  Eye, 
  AlertCircle, 
  Sparkles,
  Tag as TagIcon,
  Globe,
  Layers,
  X,
  FileSearch,
  FileText,
  Wand2,
  Check
} from 'lucide-react';
import RichTextEditor from '../../components/dashboard/RichTextEditor';
import MediaPickerModal from '../../components/dashboard/MediaPickerModal';
import VersionHistoryModal from '../../components/dashboard/VersionHistoryModal';
import AIContentGeneratorModal from '../../components/dashboard/ai/AIContentGeneratorModal';
import AIReviewModal from '../../components/dashboard/ai/AIReviewModal';
import AISummarizerModal from '../../components/dashboard/ai/AISummarizerModal';
import { StatusBadge } from '../../components/common/Badge';

export const ContentEditorPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, canPublish } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [contentType, setContentType] = useState('article');
  const [categoryId, setCategoryId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('draft');

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  // AI SEO Assistant state
  const [aiSeoLoading, setAiSeoLoading] = useState(false);
  const [aiSeoError, setAiSeoError] = useState('');
  const [aiSeoSuggestions, setAiSeoSuggestions] = useState(null);

  // Auxiliary state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Phase 2: AI Modals
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [aiReviewOpen, setAiReviewOpen] = useState(false);
  const [aiSummarizerOpen, setAiSummarizerOpen] = useState(false);

  useEffect(() => {
    fetchCategories();

    // Check if initial content was passed from AI Assistant Studio
    if (location.state && !isEditing) {
      if (location.state.initialTitle) setTitle(location.state.initialTitle);
      if (location.state.initialDescription) setDescription(location.state.initialDescription);
      if (location.state.initialBody) setBody(location.state.initialBody);
      if (location.state.initialType) setContentType(location.state.initialType);
    }

    if (isEditing) {
      fetchContent();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
        if (!isEditing && !categoryId && res.data.categories.length > 0) {
          setCategoryId(res.data.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/contents/${id}`);
      if (res.data.success) {
        const c = res.data.content;
        setTitle(c.title || '');
        setSlug(c.slug || '');
        setDescription(c.description || '');
        setBody(c.body || '');
        setContentType(c.content_type || 'article');
        setCategoryId(c.category_id || '');
        setFeaturedImage(c.featured_image || '');
        setTags(c.tags || []);
        setStatus(c.status || 'draft');
        setSeoTitle(c.seo_title || '');
        setMetaDescription(c.meta_description || '');
        setKeywords(c.keywords || '');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load content for editing.');
    } finally {
      setLoading(false);
    }
  };

  // Tag helper
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter(item => item !== t));
  };

  // Insert AI generated draft into editor
  const handleInsertAiDraft = ({ title: aiTitle, description: aiDesc, body: aiBody, contentType: aiType }) => {
    if (aiTitle) setTitle(aiTitle);
    if (aiDesc) setDescription(aiDesc);
    if (aiBody) setBody(aiBody);
    if (aiType) setContentType(aiType);
    setSuccessMsg('AI draft successfully inserted into editor. You can continue editing manually.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Generate SEO with AI
  const handleGenerateSEOWithAI = async () => {
    if (!title && !body) {
      setAiSeoError('Please enter a title or write body content first to generate SEO metadata.');
      return;
    }
    try {
      setAiSeoLoading(true);
      setAiSeoError('');
      const res = await api.post('/ai/seo', {
        title,
        description,
        body
      });
      if (res.data.success) {
        setAiSeoSuggestions(res.data.data);
      }
    } catch (err) {
      setAiSeoError(err.response?.data?.error || 'AI Assistant is currently unavailable. You can continue managing your content manually.');
    } finally {
      setAiSeoLoading(false);
    }
  };

  // Apply individual SEO suggestions
  const applySeoTitle = () => {
    if (aiSeoSuggestions?.seo_title) setSeoTitle(aiSeoSuggestions.seo_title);
  };
  const applySeoDescription = () => {
    if (aiSeoSuggestions?.meta_description) setMetaDescription(aiSeoSuggestions.meta_description);
  };
  const applyKeywords = () => {
    if (aiSeoSuggestions?.keywords) setKeywords(aiSeoSuggestions.keywords);
  };
  const applyAllSeo = () => {
    applySeoTitle();
    applySeoDescription();
    applyKeywords();
  };

  // Save handler (Authors save as draft or submit for review; Editors/Admins publish)
  const handleSave = async (targetStatus, submitReview = false) => {
    setError('');
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!body.trim()) {
      setError('Content body text cannot be empty.');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      body: body.trim(),
      content_type: contentType,
      category_id: categoryId || null,
      featured_image: featuredImage || null,
      tags,
      status: targetStatus,
      seo_title: seoTitle || title,
      meta_description: metaDescription || description,
      keywords
    };

    try {
      let savedContent;
      if (isEditing) {
        const res = await api.put(`/contents/${id}`, payload);
        savedContent = res.data.content;
      } else {
        const res = await api.post('/contents', payload);
        savedContent = res.data.content;
      }

      if (submitReview && savedContent.status !== 'pending_review') {
        const submitRes = await api.post(`/contents/${savedContent.id}/submit`);
        savedContent = submitRes.data.content;
      }

      setStatus(savedContent.status);
      setSuccessMsg(`Successfully saved as "${savedContent.status.replace('_', ' ')}"!`);

      setTimeout(() => {
        navigate('/dashboard/content');
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error saving content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-slate-400 text-sm">
        Loading content editor...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/content"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">
                {isEditing ? 'Edit Content' : 'Create New Content'}
              </h1>
              {isEditing && <StatusBadge status={status} />}
            </div>
            <p className="text-xs text-slate-500">
              {isEditing ? `Modifying slug: /${slug}` : 'Compose fresh editorial content and configure metadata.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* AI Content Generator Trigger */}
          <button
            type="button"
            onClick={() => setAiGeneratorOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Generate full draft from topic brief"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate with AI</span>
          </button>

          {/* AI Content Reviewer Trigger */}
          <button
            type="button"
            onClick={() => setAiReviewOpen(true)}
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Advisory check for grammar, clarity, repetition, and quality"
          >
            <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Review</span>
          </button>

          {/* AI Summarizer Trigger */}
          <button
            type="button"
            onClick={() => setAiSummarizerOpen(true)}
            className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Generate one-line, executive paragraph, and takeaway key points"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Summarize</span>
          </button>

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            Preview
          </button>

          {/* Version History (if editing) */}
          {isEditing && (
            <button
              type="button"
              onClick={() => setVersionModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-purple-600" />
              Revisions
            </button>
          )}

          {/* Save as Draft */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          {/* Submit for Review (Authors & Editors) */}
          {user?.role === 'author' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft', true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Submit for Review
            </button>
          )}

          {/* Direct Publish (Editors & Admins Only) */}
          {canPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Publish Directly
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editor Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Content Body & Excerpt (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Title */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Content Title <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAiGeneratorOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Brainstorm with AI
                </button>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling, descriptive headline..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Slug (Optional auto-generated)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 text-slate-500 rounded-l-xl border border-r-0 border-slate-200 text-xs font-mono">
                  /content/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="custom-url-slug"
                  className="w-full px-3 py-2 rounded-r-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Short Description / Excerpt
                </label>
                <button
                  type="button"
                  onClick={() => setAiSummarizerOpen(true)}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto-Summarize
                </button>
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief 1-2 sentence summary displayed in article cards and search results..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>

          {/* Rich Content Editor with AI Writing Assistant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Article Body Content <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Highlight text & click <strong>AI Assistant</strong> in toolbar to rewrite or fix grammar
              </span>
            </div>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Start drafting your article... Use the toolbar above to apply typography, insert quotes, links, and code blocks."
            />
          </div>

          {/* AI SEO Assistant Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  SEO & Search Optimization
                </h3>
              </div>
              
              <button
                type="button"
                onClick={handleGenerateSEOWithAI}
                disabled={aiSeoLoading}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-200 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{aiSeoLoading ? 'Analyzing...' : 'Generate SEO with AI'}</span>
              </button>
            </div>

            {aiSeoError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{aiSeoError}</span>
              </div>
            )}

            {/* AI SEO Suggestions Panel */}
            {aiSeoSuggestions && (
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 uppercase text-[10px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    AI SEO Suggestions Ready
                  </span>
                  <button
                    type="button"
                    onClick={applyAllSeo}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700"
                  >
                    Apply All Suggestions
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {aiSeoSuggestions.seo_title && (
                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Suggested Title</span>
                        <p className="font-bold text-slate-900">{aiSeoSuggestions.seo_title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={applySeoTitle}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-[11px] font-semibold"
                      >
                        Apply Title
                      </button>
                    </div>
                  )}

                  {aiSeoSuggestions.meta_description && (
                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                      <div className="pr-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Suggested Meta Description</span>
                        <p className="text-slate-700 line-clamp-2">{aiSeoSuggestions.meta_description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={applySeoDescription}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-[11px] font-semibold shrink-0"
                      >
                        Apply Desc
                      </button>
                    </div>
                  )}

                  {aiSeoSuggestions.keywords && (
                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Suggested Keywords</span>
                        <p className="text-slate-700 font-mono text-[11px]">{aiSeoSuggestions.keywords}</p>
                      </div>
                      <button
                        type="button"
                        onClick={applyKeywords}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-[11px] font-semibold"
                      >
                        Apply Keywords
                      </button>
                    </div>
                  )}
                </div>

                {aiSeoSuggestions.recommendations?.length > 0 && (
                  <div className="pt-2 border-t border-indigo-100 text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-indigo-900 uppercase text-[10px]">On-Page SEO Tips:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {aiSeoSuggestions.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Existing SEO Input Fields */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">SEO Title</label>
                  <span className="text-[10px] text-slate-400">{seoTitle.length} / 60 chars</span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || 'Search engine meta title'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Meta Description</label>
                  <span className="text-[10px] text-slate-400">{metaDescription.length} / 160 chars</span>
                </div>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={description || 'Summary for search result snippets...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. cms, react, supabase, editorial"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Taxonomy, Media & Publishing Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Classification: Content Type & Category */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Taxonomy Classification
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="article">Article (Longform)</option>
                <option value="news">News Update</option>
                <option value="announcement">Official Announcement</option>
                <option value="event">Event / Summit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag and press Enter"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      #{t}
                      <button type="button" onClick={() => removeTag(t)} className="hover:text-indigo-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Featured Image</h3>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Browse Library
              </button>
            </div>

            {featuredImage ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="Or paste external image URL"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div
                onClick={() => setMediaPickerOpen(true)}
                className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center space-y-2 transition-colors bg-slate-50/50"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Choose or Upload Featured Image</p>
                <p className="text-[11px] text-slate-400">JPG, PNG, WebP up to 5MB</p>
              </div>
            )}
          </div>

          {/* Workflow Status Info */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Publishing Workflow Policy</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {user?.role === 'author' 
                ? 'As an Author, your content is saved as a Draft. Once finalized, click "Submit for Review" so an Editor can review and publish it.' 
                : 'As an Editor/Administrator, you have permission to approve, publish, or reject content directly.'}
            </p>
          </div>

        </div>

      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(imgUrl) => setFeaturedImage(imgUrl)}
      />

      {/* Version History Modal */}
      {isEditing && (
        <VersionHistoryModal
          isOpen={versionModalOpen}
          onClose={() => setVersionModalOpen(false)}
          contentId={id}
          currentTitle={title}
        />
      )}

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-700">Public Reader Preview</span>
              <button onClick={() => setPreviewOpen(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                Close Preview
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt={title}
                  className="rounded-2xl max-h-64 w-full object-cover"
                />
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title || 'Untitled Article'}</h2>
              {description && (
                <p className="text-slate-600 text-sm font-medium border-l-4 border-indigo-500 pl-4 py-1 italic">
                  {description}
                </p>
              )}
              <div
                className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed font-serif pt-4 border-t border-slate-100"
                dangerouslySetInnerHTML={{ __html: body || '<p>No body text written yet.</p>' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: AI Modals */}
      <AIContentGeneratorModal
        isOpen={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
        onInsert={handleInsertAiDraft}
        initialType={contentType}
      />

      <AIReviewModal
        isOpen={aiReviewOpen}
        onClose={() => setAiReviewOpen(false)}
        title={title}
        body={body}
        contentType={contentType}
      />

      <AISummarizerModal
        isOpen={aiSummarizerOpen}
        onClose={() => setAiSummarizerOpen(false)}
        text={body}
        contentType={contentType}
        onInsertDescription={(desc) => setDescription(desc)}
      />

    </div>
  );
};

export default ContentEditorPage;
