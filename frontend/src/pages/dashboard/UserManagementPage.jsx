import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  CheckCircle,
  Lock
} from 'lucide-react';
import { RoleBadge } from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Action states
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null, newRole: '', loading: false });
  const [statusModal, setStatusModal] = useState({ isOpen: false, user: null, newStatus: true, loading: false });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/users', { params });
      if (res.data.success) {
        setUsers(res.data.profiles);
        setTotal(res.data.total);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChangeConfirm = async () => {
    if (!roleModal.user || !roleModal.newRole) return;
    try {
      setRoleModal(prev => ({ ...prev, loading: true }));
      setError('');
      const res = await api.put(`/users/${roleModal.user.id}/role`, { role: roleModal.newRole });
      if (res.data.success) {
        setSuccess(`Updated role for ${roleModal.user.full_name} to ${roleModal.newRole.toUpperCase()}.`);
        setRoleModal({ isOpen: false, user: null, newRole: '', loading: false });
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role.');
      setRoleModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStatusToggleConfirm = async () => {
    if (!statusModal.user) return;
    try {
      setStatusModal(prev => ({ ...prev, loading: true }));
      setError('');
      const res = await api.put(`/users/${statusModal.user.id}/status`, { is_active: statusModal.newStatus });
      if (res.data.success) {
        setSuccess(`User ${statusModal.user.full_name} is now ${statusModal.newStatus ? 'Activated' : 'Deactivated'}.`);
        setStatusModal({ isOpen: false, user: null, newStatus: true, loading: false });
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change user status.');
      setStatusModal(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Governance & Access Control</h1>
        <p className="text-xs text-slate-500">
          Administrator panel to manage staff permissions, elevate authors to editors, and enforce account security.
        </p>
      </div>

      {/* Alerts */}
      {Boolean(error) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error))}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name or email address..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators Only</option>
          <option value="editor">Editors Only</option>
          <option value="author">Authors Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-6">User Profile</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-6 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">Loading accounts...</td>
              </tr>
            ) : users.length > 0 ? (
              users.map((u) => {
                const isSelf = u.id === currentUser?.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.full_name}
                            {isSelf && (
                              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {isSelf ? (
                        <span className="text-[11px] text-slate-400 italic">Self (Protected)</span>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          {/* Role Change Selector button */}
                          <select
                            value={u.role}
                            onChange={(e) => setRoleModal({ isOpen: true, user: u, newRole: e.target.value, loading: false })}
                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          >
                            <option value="author">Author</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => setStatusModal({ isOpen: true, user: u, newStatus: !u.is_active, loading: false })}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                              u.is_active 
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                          >
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">No user accounts matched filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Role Change Confirmation */}
      <ConfirmModal
        isOpen={roleModal.isOpen}
        title="Confirm Role Change"
        message={`Are you sure you want to change the privileges for "${roleModal.user?.full_name}" to ${roleModal.newRole?.toUpperCase()}?`}
        confirmText="Update Role"
        confirmVariant="primary"
        loading={roleModal.loading}
        onConfirm={handleRoleChangeConfirm}
        onCancel={() => setRoleModal({ isOpen: false, user: null, newRole: '', loading: false })}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        title={statusModal.newStatus ? 'Activate Account' : 'Deactivate Account'}
        message={`Are you sure you want to ${statusModal.newStatus ? 'activate' : 'deactivate'} access for "${statusModal.user?.full_name}"? Deactivated accounts cannot sign in.`}
        confirmText={statusModal.newStatus ? 'Activate Account' : 'Deactivate Account'}
        confirmVariant={statusModal.newStatus ? 'primary' : 'danger'}
        loading={statusModal.loading}
        onConfirm={handleStatusToggleConfirm}
        onCancel={() => setStatusModal({ isOpen: false, user: null, newStatus: true, loading: false })}
      />

    </div>
  );
};

export default UserManagementPage;

