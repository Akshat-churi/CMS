import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle,
  FileCheck,
  X
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

export const MediaLibraryPage = () => {
  const { user, canPublish } = useAuth();
  const [mediaList, setMediaList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Preview & Delete Modals
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, loading: false });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get('/media?limit=100');
      if (res.data.success) {
        setMediaList(res.data.media);
        setTotal(res.data.total);
      }
    } catch (err) {
      setError('Failed to fetch media assets.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError('');
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setSuccess(`Image "${res.data.media.filename}" uploaded successfully!`);
        fetchMedia();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const copyUrlToClipboard = (item) => {
    navigator.clipboard.writeText(item.storage_path);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      await api.delete(`/media/${deleteModal.item.id}`);
      setDeleteModal({ isOpen: false, item: null, loading: false });
      setSuccess('Media deleted successfully.');
      fetchMedia();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete media asset.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Media Asset Library</h1>
          <p className="text-xs text-slate-500">Centralized image repository stored in Supabase Storage with local cache.</p>
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading Image...' : 'Upload Image (Max 5MB)'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
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

      {/* Media Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : mediaList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaList.map((item) => {
              const isCopied = copiedId === item.id;
              const canDelete = canPublish || item.uploaded_by === user?.id;

              return (
                <div
                  key={item.id}
                  className="group relative bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={item.storage_path}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white"
                        title="View Full Size"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyUrlToClipboard(item)}
                        className="p-2 rounded-lg bg-white/90 text-slate-900 hover:bg-white"
                        title="Copy Public URL"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, item, loading: false })}
                          className="p-2 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-50"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 text-[11px] space-y-1 bg-white">
                    <p className="font-bold text-slate-800 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{formatFileSize(item.file_size)}</span>
                      <span>{item.uploader?.full_name || 'Staff'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-xs space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p>Your media library is empty. Click "Upload Image" to add assets.</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{previewItem.filename}</h4>
                <p className="text-xs text-slate-400">{formatFileSize(previewItem.file_size)} • {previewItem.mime_type}</p>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center">
              <img src={previewItem.storage_path} alt={previewItem.filename} className="max-h-[60vh] object-contain" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-slate-500 truncate max-w-md">{previewItem.storage_path}</span>
              <button
                onClick={() => copyUrlToClipboard(previewItem)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedId === previewItem.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === previewItem.id ? 'Copied!' : 'Copy Asset Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Media File"
        message={`Are you sure you want to permanently delete "${deleteModal.item?.filename}"? Any content referencing this file URL will need to be updated.`}
        confirmText="Delete Media"
        confirmVariant="danger"
        loading={deleteModal.loading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, loading: false })}
      />

    </div>
  );
};

export default MediaLibraryPage;

