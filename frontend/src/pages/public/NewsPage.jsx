import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Radio, Calendar, ArrowRight, Clock, Tag, ExternalLink, ChevronRight, User } from 'lucide-react';
import { ContentTypeBadge } from '../../components/common/Badge';

export const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contents', {
        params: { type: 'news', limit: 30 }
      });
      if (res.data.success) {
        setNewsList(res.data.contents);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
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

  const filteredNews = selectedCategory === 'all' 
    ? newsList 
    : newsList.filter(item => item.category_id === selectedCategory);

  const featuredNews = filteredNews.length > 0 ? filteredNews[0] : null;
  const standardNews = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      
      {/* Header Section */}
      <div className="space-y-4 max-w-4xl border-b border-slate-200 pb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            Live News Desk
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Real-Time Platform & Industry Releases
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-950 tracking-tight leading-[1.1]">
          News & Press Releases
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
          Official releases, company milestones, strategic integrations, and major technical breakthroughs across the ContentPilot ecosystem.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All News
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="space-y-12">
          
          {/* Featured Top News Story */}
          {featuredNews && (
            <div className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 group">
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-900">
                <img
                  src={featuredNews.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                  alt={featuredNews.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute top-5 left-5">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase bg-sky-600 text-white shadow-md">
                    Lead Story
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-bold uppercase tracking-wider">
                    <span>{featuredNews.category?.name || 'Press Release'}</span>
                    <span>•</span>
                    <span>{formatDate(featuredNews.published_at || featuredNews.created_at)}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-white group-hover:text-sky-300 transition-colors leading-tight">
                    <Link to={`/content/${featuredNews.slug}`}>
                      {featuredNews.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {featuredNews.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">By {featuredNews.author?.full_name || 'Newsroom'}</span>
                  <Link
                    to={`/content/${featuredNews.slug}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Read Full Release <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Standard News Items Feed */}
          {standardNews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {standardNews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group"
                >
                  {item.featured_image && (
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase">
                      <span className="text-sky-700">{item.category?.name || 'News'}</span>
                      <span>•</span>
                      <span>{formatDate(item.published_at || item.created_at)}</span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                      <Link to={`/content/${item.slug}`}>{item.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">By {item.author?.full_name || 'Editorial Staff'}</span>
                    <Link
                      to={`/content/${item.slug}`}
                      className="font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <Radio className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-lg font-serif font-bold text-slate-800">No news bulletins published in this desk</h3>
          <p className="text-xs text-slate-500">Check back soon or select another category above.</p>
        </div>
      )}

    </div>
  );
};

export default NewsPage;
