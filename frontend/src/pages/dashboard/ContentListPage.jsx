import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Send, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, ContentTypeBadge } from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';

export const ContentListPage = () => {
  const { user, canPublish } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const currentStatus = searchParams.get('status') || 'all';
  const currentType = searchParams.get('type') || 'all';
  const currentCategory = searchParams.get('categoryId') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Modals state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, loading: false });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, item: null, reason: '', loading: false });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, item: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchContents();
  }, [currentStatus, currentType, currentCategory, currentSearch]);

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
        limit: 50
      };
      if (currentStatus !== 'all') params.status = currentStatus;
      if (currentType !== 'all') params.type = currentType;
      if (currentCategory !== 'all') params.categoryId = currentCategory;
      if (currentSearch) params.search = currentSearch;

      const res = await api.get('/contents/manage', { params });
      if (res.data.success) {
        setContents(res.data.contents);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching management contents:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val && val !== 'all') {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  // Workflow: Author submits draft for review
  const handleSubmitForReview = async (item) => {
    try {
      const res = await api.post(`/contents/${item.id}/submit`);
      if (res.data.success) {
        fetchContents();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit content for review.');
    }
  };

  // Workflow: Editor/Admin approves and publishes
  const handleApprovePublish = async (item) => {
    try {
      const res = await api.post(`/contents/${item.id}/review`, { action: 'approve' });
      if (res.data.success) {
        fetchContents();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to publish content.');
    }
  };

  // Workflow: Editor/Admin rejects
  const handleRejectConfirm = async () => {
    if (!rejectModal.item) return;
    try {
      setRejectModal(prev => ({ ...prev, loading: true }));
      const res = await api.post(`/contents/${rejectModal.item.id}/review`, {
        action: 'reject',
        rejection_reason: rejectModal.reason || 'Does not align with editorial guidelines.'
      });
      if (res.data.success) {
        setRejectModal({ isOpen: false, item: null, reason: '', loading: false });
        fetchContents();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject content.');
      setRejectModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const res = await api.delete(`/contents/${deleteModal.item.id}`);
      if (res.data.success) {
        setDeleteModal({ isOpen: false, item: null, loading: false });
        fetchContents();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete content.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const tabs = [
    { label: 'All Content', value: 'all' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Pending Review', value: 'pending_review' },
    { label: 'Published', value: 'published' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Content Management</h1>
          <p className="text-xs text-slate-500">
            {user?.role === 'author' 
              ? 'Manage your personal drafts, submissions, and editorial feedback.' 
              : 'Review editorial submissions, manage drafts, and govern publishing status.'}
          </p>
        </div>

        <Link
          to="/dashboard/content/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Content
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => updateFilter('status', tab.value)}
              className={`pb-3 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </form>

        {/* Content Type Filter */}
        <select
          value={currentType}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="w-full md:w-auto px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Content Types</option>
          <option value="article">Articles</option>
          <option value="news">News</option>
          <option value="announcement">Announcements</option>
          <option value="event">Events</option>
        </select>

        {/* Category Filter */}
        <select
          value={currentCategory}
          onChange={(e) => updateFilter('categoryId', e.target.value)}
          className="w-full md:w-auto px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-6">Title & Summary</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading content records...
                  </td>
                </tr>
              ) : contents.length > 0 ? (
                contents.map((item) => {
                  const isAuthor = user?.role === 'author';
                  const isOwner = item.author_id === user?.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Title */}
                      <td className="py-4 px-6 max-w-xs sm:max-w-md">
                        <div className="font-bold text-slate-900 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.description || 'No excerpt'}
                        </div>
                        {item.status === 'rejected' && item.rejection_reason && (
                          <div className="mt-1 text-[11px] text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                            <strong>Feedback:</strong> {item.rejection_reason}
                          </div>
                        )}
                      </td>

                      {/* Content Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <ContentTypeBadge type={item.content_type} />
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {item.category?.name || '—'}
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-700">
                        {item.author?.full_name || 'Staff'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewModal({ isOpen: true, item })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Preview Content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Public View link if published */}
                          {item.status === 'published' && (
                            <Link
                              to={`/content/${item.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                              title="View on Public Site"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Workflow: Author Submit for Review */}
                          {isAuthor && isOwner && (item.status === 'draft' || item.status === 'rejected') && (
                            <button
                              type="button"
                              onClick={() => handleSubmitForReview(item)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1"
                              title="Submit for editorial review"
                            >
                              <Send className="w-3 h-3" />
                              Submit
                            </button>
                          )}

                          {/* Workflow: Editor/Admin Review Operations */}
                          {canPublish && item.status === 'pending_review' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprovePublish(item)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1"
                                title="Approve & Publish"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectModal({ isOpen: true, item, reason: '', loading: false })}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1"
                                title="Reject with feedback"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}

                          {/* Edit Button: allowed if author on own draft/rejected, or editor/admin on any */}
                          {(!isAuthor || (isOwner && item.status !== 'published')) && (
                            <Link
                              to={`/dashboard/content/edit/${item.id}`}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Edit Content"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Delete Button: allowed if author on own draft, or editor/admin on any */}
                          {(!isAuthor || (isOwner && item.status === 'draft')) && (
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ isOpen: true, item, loading: false })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Content"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No content items matched the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {contents.length} of {total} records</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Content Record"
        message={`Are you sure you want to delete "${deleteModal.item?.title}"? This action permanently removes the record and cannot be undone.`}
        confirmText="Permanently Delete"
        confirmVariant="danger"
        loading={deleteModal.loading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
      />

      {/* Reject with Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Reject Submission</h3>
            <p className="text-xs text-slate-600">
              Provide feedback to the author explains why this content cannot be published at this time.
            </p>
            <textarea
              rows={3}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Please add references and refine introductory statements..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            ></textarea>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, item: null, reason: '', loading: false })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={rejectModal.loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {rejectModal.loading ? 'Rejecting...' : 'Reject Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.isOpen && previewModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <StatusBadge status={previewModal.item.status} />
                <span className="text-xs font-bold text-slate-700 truncate max-w-md">Preview: {previewModal.item.title}</span>
              </div>
              <button
                onClick={() => setPreviewModal({ isOpen: false, item: null })}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close Preview
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              {previewModal.item.featured_image && (
                <img
                  src={previewModal.item.featured_image}
                  alt={previewModal.item.title}
                  className="rounded-2xl max-h-64 w-full object-cover"
                />
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {previewModal.item.title}
              </h2>
              {previewModal.item.description && (
                <p className="text-slate-600 text-sm font-medium border-l-4 border-indigo-500 pl-4 py-1 italic">
                  {previewModal.item.description}
                </p>
              )}
              <div
                className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed font-serif pt-4 border-t border-slate-100"
                dangerouslySetInnerHTML={{ __html: previewModal.item.body }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContentListPage;

