import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Activity, Filter, Calendar, User, ShieldAlert } from 'lucide-react';
import { RoleBadge } from '../../components/common/Badge';

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (actionFilter !== 'all') params.action = actionFilter;

      const res = await api.get('/activity-logs', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const map = {
      USER_LOGIN: 'bg-slate-100 text-slate-700 border-slate-200',
      USER_REGISTER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CONTENT_CREATE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      CONTENT_UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
      CONTENT_SUBMIT: 'bg-amber-50 text-amber-700 border-amber-200',
      CONTENT_PUBLISH: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      CONTENT_REJECT: 'bg-rose-50 text-rose-700 border-rose-200',
      CONTENT_DELETE: 'bg-rose-100 text-rose-800 border-rose-300',
      ROLE_CHANGE: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
      MEDIA_UPLOAD: 'bg-sky-50 text-sky-700 border-sky-200',
    };
    const style = map[action] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${style}`}>
        {action}
      </span>
    );
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security & Audit Activity Logs</h1>
          <p className="text-xs text-slate-500">
            Immutable log of all editorial actions, logins, status updates, and user governance events.
          </p>
        </div>

        {/* Filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          <option value="all">All Actions</option>
          <option value="CONTENT_PUBLISH">Published Content</option>
          <option value="CONTENT_SUBMIT">Submitted for Review</option>
          <option value="CONTENT_REJECT">Rejected Submissions</option>
          <option value="CONTENT_CREATE">Content Created</option>
          <option value="CONTENT_UPDATE">Content Updated</option>
          <option value="CONTENT_DELETE">Content Deleted</option>
          <option value="ROLE_CHANGE">Role Changes</option>
          <option value="USER_LOGIN">User Logins</option>
          <option value="USER_REGISTER">User Registrations</option>
          <option value="MEDIA_UPLOAD">Media Uploads</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-6">Timestamp</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-6">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-400">Loading audit records...</td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 whitespace-nowrap font-mono text-[11px] text-slate-500">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {log.user ? (
                      <div>
                        <span className="font-bold text-slate-900 block">{log.user.full_name}</span>
                        <RoleBadge role={log.user.role} />
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono">System Engine</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-slate-700 leading-relaxed font-sans">
                    {log.description}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-400">No activity logs recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          Total audit records: {total}
        </div>
      </div>

    </div>
  );
};

export default ActivityLogsPage;

