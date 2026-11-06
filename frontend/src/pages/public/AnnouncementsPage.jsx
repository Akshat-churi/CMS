import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Bell, Info, ShieldAlert, ArrowRight, AlertCircle, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { ContentTypeBadge } from '../../components/common/Badge';

export const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contents', {
        params: { type: 'announcement', limit: 30 }
      });
      if (res.data.success) {
        setAnnouncements(res.data.contents);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      
      {/* Header Section */}
      <div className="space-y-4 max-w-4xl border-b border-slate-200 pb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            Official Platform Bulletins
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {announcements.length} Verified Notices
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-950 tracking-tight leading-[1.1]">
          Platform Bulletins & Notices
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
          Essential operational advisories, infrastructure maintenance windows, platform release logs, and security governance updates.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {announcements.map((item, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={item.id}
                className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
                  isFirst
                    ? 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-amber-300 shadow-lg'
                    : 'bg-white border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isFirst ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isFirst ? 'High Priority Notice' : 'Official Notice'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.published_at || item.created_at)}
                    </span>
                  </div>

                  <h2 className="font-serif font-bold text-2xl text-slate-900 hover:text-amber-700 transition-colors leading-snug">
                    <Link to={`/content/${item.slug}`}>{item.title}</Link>
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Issued by: {item.author?.full_name || 'Administration Desk'}
                  </span>
                  <Link
                    to={`/content/${item.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    <span>Read Full Bulletin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <Bell className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-lg font-serif font-bold text-slate-800">No active notices</h3>
          <p className="text-xs text-slate-500">All systems operational. No scheduled maintenance bulletins at this time.</p>
        </div>
      )}

    </div>
  );
};

export default AnnouncementsPage;
