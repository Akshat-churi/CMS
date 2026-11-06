import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Tag, 
  Bell, 
  Radio, 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  Bookmark,
  Share2,
  Compass,
  Zap,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { ContentTypeBadge } from '../../components/common/Badge';

export const HomePage = () => {
  const [leadStory, setLeadStory] = useState(null);
  const [bentoStories, setBentoStories] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentsRes, categoriesRes, newsRes, annRes, eventRes] = await Promise.all([
          api.get('/contents?limit=12'),
          api.get('/categories'),
          api.get('/contents?type=news&limit=4'),
          api.get('/contents?type=announcement&limit=3'),
          api.get('/contents?type=event&limit=2')
        ]);

        if (contentsRes.data.success) {
          const list = contentsRes.data.contents;
          if (list.length > 0) {
            // Distinct Bento grid layout
            setLeadStory(list[0]);
            // Next 4 stories for the asymmetric Bento grid
            setBentoStories(list.slice(1, 5));
            // Remaining stories for the Latest Articles grid
            setLatestArticles(list.slice(5));
          }
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.categories);
        }
        if (newsRes.data.success) {
          setNewsList(newsRes.data.contents);
        }
        if (annRes.data.success) {
          setAnnouncements(annRes.data.contents);
        }
        if (eventRes.data.success) {
          setEvents(eventRes.data.contents);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Estimate read time based on description + body length
  const estimateReadTime = (content) => {
    const text = (content?.description || '') + ' ' + (content?.body || '');
    const words = text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  return (
    <div className="space-y-20 pb-24">
      
      {/* Editorial Masthead Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                Lead Dispatch
              </span>
              <span className="text-xs text-slate-400">Peer-Reviewed Editorial Publication</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Published with ContentPilot Data Engine</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-white leading-[1.08]">
                Where technology, architecture, & editorial rigor converge.
              </h1>
              <p className="text-base sm:text-lg text-slate-400 font-light max-w-2xl leading-relaxed">
                Independent investigative essays, systems design breakdowns, and technical dispatches produced by engineering authors and editorial stewards.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, news, architecture..."
                  className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-slate-900 text-white placeholder-slate-500 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Explore
                </button>
              </form>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider mr-2">Featured Topics:</span>
            {categories.slice(0, 5).map(cat => (
              <Link
                key={cat.id}
                to={`/articles?categoryId=${cat.id}`}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-indigo-950/80 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-700/60 transition-all flex items-center gap-1.5"
              >
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Main Content Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {/* ============================================================== */}
        {/* ASYMMETRIC BENTO GRID FEATURED SHOWCASE                        */}
        {/* ============================================================== */}
        {leadStory && (
          <section className="space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 tracking-tight">
                  Featured Stories & Cover Essays
                </h2>
              </div>
              <Link 
                to="/articles" 
                className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                View all stories <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Asymmetric Bento Grid (12-Column Masterpiece) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Card 1: The Lead Cover Story (8 columns, high editorial prominence) */}
              <div className="lg:col-span-8 group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-end min-h-[460px] lg:min-h-[540px]">
                {/* Background Image with Layered Gradients */}
                <img
                  src={leadStory.featured_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80'}
                  alt={leadStory.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/10 pointer-events-none"></div>

                {/* Top Badges */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-600 text-white shadow-md">
                      Cover Feature
                    </span>
                    {leadStory.category && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-900/80 text-slate-200 border border-slate-700/60 backdrop-blur">
                        {leadStory.category.name}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/70 px-3 py-1 rounded-full backdrop-blur border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{estimateReadTime(leadStory)}</span>
                  </div>
                </div>

                {/* Lead Story Content Overlay */}
                <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-3xl">
                  <div className="text-xs text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-2">
                    <span>Published {formatDate(leadStory.published_at || leadStory.created_at)}</span>
                    <span>•</span>
                    <span>By {leadStory.author?.full_name || 'Staff Editor'}</span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-[1.15] group-hover:text-indigo-200 transition-colors">
                    <Link to={`/content/${leadStory.slug}`}>
                      {leadStory.title}
                    </Link>
                  </h3>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 font-normal">
                    {leadStory.description}
                  </p>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      to={`/content/${leadStory.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      <span>Read Cover Story</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bento Right Column (4 columns) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Card 2: Secondary Spotlight */}
                {bentoStories[0] && (
                  <div className="flex-1 rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={bentoStories[0].featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'}
                        alt={bentoStories[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <ContentTypeBadge type={bentoStories[0].content_type} />
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold uppercase">
                          <span>{bentoStories[0].category?.name || 'Deep Dive'}</span>
                          <span>•</span>
                          <span>{formatDate(bentoStories[0].published_at || bentoStories[0].created_at)}</span>
                        </div>
                        <h4 className="font-serif font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          <Link to={`/content/${bentoStories[0].slug}`}>
                            {bentoStories[0].title}
                          </Link>
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {bentoStories[0].description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{estimateReadTime(bentoStories[0])}</span>
                        <Link to={`/content/${bentoStories[0].slug}`} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                          Read <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card 3: Editorial Focus Pill */}
                {bentoStories[1] && (
                  <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-lg border border-indigo-800/40 space-y-3 group flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                          {bentoStories[1].category?.name || 'Perspective'}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                        <Link to={`/content/${bentoStories[1].slug}`}>
                          {bentoStories[1].title}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-light">
                        {bentoStories[1].description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>By {bentoStories[1].author?.full_name || 'Staff'}</span>
                      <Link to={`/content/${bentoStories[1].slug}`} className="text-indigo-300 font-bold hover:text-white flex items-center gap-1">
                        Read Story <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Bottom Bento Tier (Numbered Highlights) */}
            {bentoStories.length > 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {bentoStories.slice(2, 4).map((story, idx) => (
                  <div
                    key={story.id}
                    className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-start gap-5 group"
                  >
                    <span className="text-4xl font-serif font-black text-slate-200 group-hover:text-indigo-500 transition-colors shrink-0">
                      0{idx + 3}
                    </span>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 uppercase font-semibold">
                        <span>{story.category?.name || 'Analysis'}</span>
                        <span>•</span>
                        <span>{formatDate(story.published_at || story.created_at)}</span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        <Link to={`/content/${story.slug}`}>{story.title}</Link>
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {story.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </section>
        )}

        {/* ============================================================== */}
        {/* POPULAR CATEGORIES CURATION BAR                                */}
        {/* ============================================================== */}
        {categories.length > 0 && (
          <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Explore Curated Disciplines</h3>
                <p className="text-xs text-slate-500">Filter stories across core editorial desks and categories.</p>
              </div>
              <Link to="/articles" className="text-xs font-bold text-indigo-600 hover:underline">
                View all archives →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/articles?categoryId=${cat.id}`}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/60 hover:border-indigo-300 text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mx-auto shadow-sm transition-colors mb-2">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 truncate">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Explore stories</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* LATEST ARTICLES EDITORIAL GRID                                */}
        {/* ============================================================== */}
        <section className="space-y-8">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
                Latest Published Articles
              </h2>
              <p className="text-xs text-slate-500 mt-1">In-depth essays, technical architectures, and software craftsmanship.</p>
            </div>
            <Link 
              to="/articles" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              Browse complete index <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((art) => (
                <article
                  key={art.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Article Card Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={art.featured_image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-4 left-4">
                      <ContentTypeBadge type={art.content_type} />
                    </div>
                  </div>

                  {/* Article Meta & Content */}
                  <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                        <span className="text-indigo-600 font-bold">{art.category?.name || 'General'}</span>
                        <span>•</span>
                        <span>{formatDate(art.published_at || art.created_at)}</span>
                        <span>•</span>
                        <span>{estimateReadTime(art)}</span>
                      </div>

                      <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        <Link to={`/content/${art.slug}`}>{art.title}</Link>
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {art.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                          {art.author?.full_name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{art.author?.full_name || 'Staff'}</span>
                      </div>

                      <Link 
                        to={`/content/${art.slug}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Read Story →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
              No additional published articles available.
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* SPLIT SECTION: NEWSROOM WIRE & OFFICIAL BULLETINS              */}
        {/* ============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Newsroom Wire (7 columns) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">Newsroom Wire</h3>
                  <p className="text-xs text-slate-500">Industry developments, product rollouts & updates</p>
                </div>
              </div>
              <Link to="/news" className="text-xs font-bold text-sky-600 hover:underline">
                All news →
              </Link>
            </div>

            <div className="space-y-4">
              {newsList.map((item) => (
                <div 
                  key={item.id} 
                  className="p-5 rounded-2xl bg-slate-50/70 hover:bg-sky-50/40 border border-slate-100 hover:border-sky-200 transition-all flex flex-col sm:flex-row gap-4 items-start group"
                >
                  {item.featured_image && (
                    <div className="w-full sm:w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-200">
                      <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-sky-700 uppercase">
                      <span>News Wire</span>
                      <span>•</span>
                      <span>{formatDate(item.published_at || item.created_at)}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                      <Link to={`/content/${item.slug}`}>{item.title}</Link>
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Announcements & System Bulletins (5 columns) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/5 to-slate-50 rounded-3xl p-8 border border-amber-200/60 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">Official Notices</h3>
                    <p className="text-xs text-slate-500">Platform bulletins & policies</p>
                  </div>
                </div>
                <Link to="/announcements" className="text-xs font-bold text-amber-700 hover:underline">
                  All notices →
                </Link>
              </div>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div 
                    key={ann.id}
                    className="p-5 rounded-2xl bg-white border border-amber-200/50 shadow-sm space-y-2 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        Notice
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(ann.published_at || ann.created_at)}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900 hover:text-amber-800">
                      <Link to={`/content/${ann.slug}`}>{ann.title}</Link>
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ann.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-amber-200/40">
              <Link 
                to="/announcements" 
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                <span>Read Official Platform Notices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </section>

        {/* ============================================================== */}
        {/* SUMMITS, CONFERENCES & EVENTS SECTION                          */}
        {/* ============================================================== */}
        {events.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
                  Upcoming Summits & Engineering Events
                </h2>
                <p className="text-xs text-slate-500 mt-1">Join in-person symposiums, virtual workshops, and architectural summits.</p>
              </div>
              <Link to="/events" className="text-xs font-bold text-fuchsia-600 hover:underline">
                View event calendar →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col group"
                >
                  <div className="relative h-60 overflow-hidden bg-slate-950">
                    <img
                      src={ev.featured_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase bg-fuchsia-600 text-white shadow-md">
                        Featured Summit
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs font-bold text-fuchsia-700">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(ev.published_at || ev.created_at)}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">San Francisco / Hybrid</span>
                      </div>

                      <h3 className="font-serif font-bold text-2xl text-slate-900 group-hover:text-fuchsia-700 transition-colors">
                        <Link to={`/content/${ev.slug}`}>{ev.title}</Link>
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {ev.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Free Registration Available</span>
                      <Link
                        to={`/content/${ev.slug}`}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-fuchsia-600 text-xs font-bold transition-colors"
                      >
                        <span>Event Agenda</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default HomePage;
