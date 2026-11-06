import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  Mail, 
  ArrowRight,
  Globe
} from 'lucide-react';
import { ContentTypeBadge } from '../../components/common/Badge';

export const ContentDetailPage = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/contents/slug/${slug}`);
        if (res.data.success) {
          setContent(res.data.content);
          setRelated(res.data.related || []);
        }
      } catch (err) {
        console.error('Error fetching content detail:', err);
        setError(err.response?.data?.error || 'Article not found or not published.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchContent();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  // Scroll Progress Bar calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scroll = (totalScroll / windowHeight) * 100;
        setScrollProgress(scroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Reading "${content?.title}" on ContentPilot:`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(content?.title || 'Article from ContentPilot');
    const body = encodeURIComponent(`Check out this article on ContentPilot:\n\n${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const estimateReadTime = (item) => {
    const text = (item?.description || '') + ' ' + (item?.body || '');
    const words = text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
    return `${Math.max(2, Math.ceil(words / 200))} min read`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 space-y-8 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded"></div>
        <div className="h-14 w-full bg-slate-200 rounded-2xl"></div>
        <div className="h-8 w-2/3 bg-slate-200 rounded"></div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
        <div className="space-y-4 pt-6">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 text-center space-y-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShieldCheck className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900">Article Unavailable</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          {error || 'This content either does not exist, has been removed, or has not yet been approved and published by an editor.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-indigo-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Publication Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      
      {/* Fixed Sticky Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-slate-200/50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-10">
        
        {/* Top Breadcrumb & Back Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link to={`/articles?categoryId=${content.category_id}`} className="hover:text-indigo-600 transition-colors">
              {content.category?.name || 'Articles'}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ContentTypeBadge type={content.content_type} />
          </div>
        </div>

        {/* Editorial Headline Block */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
            <span>{content.category?.name || 'Special Report'}</span>
            <span>•</span>
            <span>{estimateReadTime(content)}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-950 tracking-tight leading-[1.12]">
            {content.title}
          </h1>

          {content.description && (
            <p className="text-lg sm:text-2xl text-slate-600 font-light leading-relaxed font-sans">
              {content.description}
            </p>
          )}
        </div>

        {/* Author Byline & Social Sharing Strip */}
        <div className="py-6 border-y border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          {/* Author Card */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-800 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {content.author?.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {content.author?.full_name || 'Staff Editor'}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                <span className="capitalize">{content.author?.role || 'Contributing Author'}</span>
                <span>•</span>
                <span>{formatDate(content.published_at || content.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Social Share Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Copy link to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={shareOnTwitter}
              aria-label="Share on X"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Share on X (Twitter)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>

            <button
              onClick={shareOnLinkedIn}
              aria-label="Share on LinkedIn"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Share on LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24"/>
              </svg>
            </button>

            <button
              onClick={shareViaEmail}
              aria-label="Email Story"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
            </button>

            <button
              onClick={() => setBookmarked(!bookmarked)}
              aria-label="Bookmark Story"
              className={`p-2 rounded-xl border transition-colors ${
                bookmarked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Featured Hero Image */}
        {content.featured_image && (
          <div className="space-y-2">
            <div className="rounded-3xl overflow-hidden shadow-xl bg-slate-950 aspect-[16/9]">
              <img
                src={content.featured_image}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-slate-400 italic text-center">
              Published under ContentPilot editorial guidelines. Verified by editorial desk.
            </p>
          </div>
        )}

        {/* Article Body (HTML Rich Text) */}
        <div 
          className="editorial-prose pt-4"
          dangerouslySetInnerHTML={{ __html: content.body || '<p>No content body provided.</p>' }}
        />

        {/* Article Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Related Topic Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, i) => (
                <Link
                  key={i}
                  to={`/articles?search=${encodeURIComponent(tag)}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-semibold text-slate-700 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Card Footer */}
        <div className="p-8 rounded-3xl bg-slate-100/80 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-serif font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
            {content.author?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-lg text-slate-900">
                  {content.author?.full_name || 'Staff Contributor'}
                </h4>
                <p className="text-xs text-slate-500 capitalize">
                  {content.author?.role || 'Author'} • Verified Editorial Contributor
                </p>
              </div>
              <Link
                to={`/articles?search=${encodeURIComponent(content.author?.full_name || '')}`}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                More from this author →
              </Link>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Contributing technical author for ContentPilot. Specializing in digital architectures, systems engineering, and publishing workflows.
            </p>
          </div>
        </div>

      </article>

      {/* Related Articles Section (Full Width Band) */}
      {related && related.length > 0 && (
        <section className="mt-20 pt-16 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-serif font-bold text-2xl text-slate-900">Recommended Reading</h3>
                <p className="text-xs text-slate-500">More stories from the same editorial category.</p>
              </div>
              <Link to="/articles" className="text-xs font-bold text-indigo-600 hover:underline">
                View all articles →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  className="bg-slate-50/70 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                    <img
                      src={rel.featured_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        {rel.category?.name || 'Related'}
                      </span>
                      <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        <Link to={`/content/${rel.slug}`}>{rel.title}</Link>
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{rel.description}</p>
                    </div>
                    <Link
                      to={`/content/${rel.slug}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-2"
                    >
                      Read story <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default ContentDetailPage;
