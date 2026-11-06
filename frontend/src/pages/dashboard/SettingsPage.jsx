import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, ShieldCheck, Database, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { RoleBadge } from '../../components/common/Badge';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.get('/health');
      setSystemHealth(res.data);
    } catch (e) {
      setSystemHealth({ status: 'offline', error: e.message });
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    if (password && password.length < 6) {
      setErr('New password must be at least 6 characters.');
      return;
    }
    if (password && password !== confirmPassword) {
      setErr('Passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        full_name: fullName,
        ...(password ? { password } : {})
      });
      setMsg('Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Account Settings</h1>
        <p className="text-xs text-slate-500">Configure your contributor credentials and inspect system health.</p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {err && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* System Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">ContentPilot Platform Diagnostics</h3>
            <p className="text-xs text-slate-500">Database and storage operational environment.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-bold uppercase">System Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-900 capitalize">{systemHealth?.status || 'Online'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Database Layer</span>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate">
              {systemHealth?.mode || 'Supabase / Local Engine'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Active Build</span>
            <p className="text-xs font-bold text-slate-900 mt-1">
              Phase 1 (Complete CMS)
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Credentials</h3>
            <p className="text-xs text-slate-500">Update personal display name and change login password.</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Email address is managed via authentication security.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Role</label>
            <div className="pt-1">
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Change Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (optional)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default SettingsPage;

