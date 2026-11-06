import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Search, Filter, Calendar, Tag, ArrowRight, User, Clock, ArrowUpDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentTypeBadge } from '../../components/common/Badge';

export const ArticlesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('categoryId') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9;

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchContents();
    setSearchInput(currentSearch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategory, currentSearch, currentSort, currentPage]);

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

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = {
        type: 'article',
        page: currentPage,
        limit,
        sort: currentSort
      };
      if (currentCategory !== 'all') params.categoryId = currentCategory;
      if (currentSearch) params.search = currentSearch;

      const res = await api.get('/contents', { params });
      if (res.data.success) {
        setContents(res.data.contents);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val && val !== 'all') {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const estimateReadTime = (item) => {
    const text = (item?.description || '') + ' ' + (item?.body || '');
    const words = text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
    return `${Math.max(2, Math.ceil(words / 200))} min read`;
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      
      {/* Editorial Header Section */}
      <div className="space-y-4 max-w-4xl border-b border-slate-200 pb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            The Longform Archive
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {total} Published {total === 1 ? 'Article' : 'Articles'}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-950 tracking-tight leading-[1.1]">
          Articles & Longform Editorial
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
          Deep technical dives, architectural analyses, and thought leadership authored by practitioners and peer-reviewed by our editorial desk.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        
        {/* Top Controls: Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search across title, keywords, or topics..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); updateParam('search', ''); }}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>

        {/* Category Pills Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider mr-1">Filter Desk:</span>
          
          <button
            onClick={() => updateParam('categoryId', 'all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Desks
          </button>

          {categories.map((cat) => {
            const active = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => updateParam('categoryId', cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          {(currentCategory !== 'all' || currentSearch) && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Article Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : contents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contents.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Frame */}
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

              {/* Body */}
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
                    Read Essay →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4 p-8">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900">No articles matched your criteria</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search terms or clearing the desk filter to view all published stories.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={currentPage <= 1}
            onClick={() => updateParam('page', (currentPage - 1).toString())}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => updateParam('page', pageNum.toString())}
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            disabled={currentPage >= totalPages}
            onClick={() => updateParam('page', (currentPage + 1).toString())}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default ArticlesPage;
