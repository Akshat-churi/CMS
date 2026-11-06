import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  CheckCircle, 
  FileEdit, 
  Clock, 
  Users, 
  PlusCircle, 
  Image as ImageIcon, 
  ArrowRight, 
  TrendingUp, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { StatusBadge, ContentTypeBadge, RoleBadge } from '../../components/common/Badge';

export const OverviewPage = () => {
  const { user, canPublish, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalContent: 0,
    publishedCount: 0,
    draftsCount: 0,
    pendingCount: 0,
    totalUsers: 0
  };

  const statCards = [
    {
      label: user?.role === 'author' ? 'My Total Content' : 'Total Content',
      value: stats.totalContent,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      link: '/dashboard/content'
    },
    {
      label: 'Published',
      value: stats.publishedCount,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      link: '/dashboard/content?status=published'
    },
    {
      label: 'Pending Review',
      value: stats.pendingCount,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      link: '/dashboard/content?status=pending_review',
      highlight: stats.pendingCount > 0
    },
    {
      label: 'Drafts',
      value: stats.draftsCount,
      icon: FileEdit,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      link: '/dashboard/content?status=draft'
    },
    ...(isAdmin ? [{
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      link: '/dashboard/users'
    }] : [])
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
            <span>Welcome back, {user?.full_name}</span>
            <span>•</span>
            <span className="capitalize">{user?.role} Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Editorial Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
            Real-time status of content production pipelines, review queues, and published feeds.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/content/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs shadow hover:bg-indigo-50 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            Create Content
          </Link>
          <Link
            to="/dashboard/media"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/40 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Media Library
          </Link>
        </div>
      </div>

      {/* Dynamic Statistics Cards */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {statCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              className={`p-5 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                card.highlight ? 'ring-2 ring-amber-400 border-amber-200' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{card.value}</span>
                <span className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center">
                  View <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Content Status & Content Types Breakdown */}
      {data?.byType && (
        <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Active Content Taxonomies
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-700">Articles</span>
              <p className="text-2xl font-black text-indigo-950 mt-1">{data.byType.article}</p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
              <span className="text-xs font-semibold text-sky-700">News Updates</span>
              <p className="text-2xl font-black text-sky-950 mt-1">{data.byType.news}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
              <span className="text-xs font-semibold text-amber-700">Announcements</span>
              <p className="text-2xl font-black text-amber-950 mt-1">{data.byType.announcement}</p>
            </div>
            <div className="p-4 rounded-2xl bg-fuchsia-50/50 border border-fuchsia-100">
              <span className="text-xs font-semibold text-fuchsia-700">Events & Summits</span>
              <p className="text-2xl font-black text-fuchsia-950 mt-1">{data.byType.event}</p>
            </div>
          </div>
        </section>
      )}

      {/* Two Column Layout: Recently Updated Content & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recently Updated Content Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recently Updated</h3>
            </div>
            <Link to="/dashboard/content" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All Content
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentlyUpdated?.length > 0 ? (
                  data.recentlyUpdated.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-3 pr-2">
                        <p className="font-bold text-slate-900 truncate max-w-xs">{c.title}</p>
                        <span className="text-[10px] text-slate-400">By {c.author?.full_name}</span>
                      </td>
                      <td className="py-3">
                        <ContentTypeBadge type={c.content_type} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/dashboard/content/edit/${c.id}`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No content items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Audit Stream (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Audit Activity</h3>
            </div>
            {(isAdmin || canPublish) && (
              <Link to="/dashboard/activity" className="text-xs font-semibold text-indigo-600 hover:underline">
                Audit Logs
              </Link>
            )}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
            {data?.recentActivity?.length > 0 ? (
              data.recentActivity.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{log.user?.full_name || 'System Engine'}</span>
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-snug">{log.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No recent activity recorded.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default OverviewPage;

