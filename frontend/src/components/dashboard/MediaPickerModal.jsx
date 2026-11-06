import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { X, Upload, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const MediaPickerModal = ({ isOpen, onClose, onSelect }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setError('');
      setSelectedItem(null);
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get('/media?limit=40');
      if (res.data.success) {
        setMediaList(res.data.media);
      }
    } catch (err) {
      setError('Failed to load media assets.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
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
        setMediaList([res.data.media, ...mediaList]);
        setSelectedItem(res.data.media);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem.storage_path);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Select Media Asset</h3>
              <p className="text-xs text-slate-500">Pick from existing library or upload a new image.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error alert */}
        {Boolean(error) && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error))}</span>
          </div>
        )}

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : mediaList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mediaList.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-video group bg-slate-100 ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                        : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={item.storage_path}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-slate-900/70 text-white text-[10px] truncate">
                      {item.filename}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              No media files uploaded yet. Click "Upload Image" above to upload your first asset.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 truncate max-w-md">
            {selectedItem ? `Selected: ${selectedItem.filename}` : 'Select an image to attach'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedItem}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-40"
            >
              Use Selected Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MediaPickerModal;

