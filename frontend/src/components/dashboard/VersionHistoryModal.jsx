import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { X, History, User, Calendar, AlertCircle } from 'lucide-react';

export const VersionHistoryModal = ({ isOpen, onClose, contentId, currentTitle }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (isOpen && contentId) {
      fetchVersions();
    }
  }, [isOpen, contentId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/contents/${contentId}/versions`);
      if (res.data.success) {
        setVersions(res.data.versions);
        if (res.data.versions.length > 0) {
          setSelectedVersion(res.data.versions[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching version history:', err);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revision History</h3>
              <p className="text-xs text-slate-500">Tracked versions for: "{currentTitle}"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Versions List (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-100 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
            {loading ? (
              <p className="text-xs text-slate-400 p-4 text-center">Loading version snapshots...</p>
            ) : versions.length > 0 ? (
              versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                return (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-white border-purple-300 shadow-sm'
                        : 'bg-white/60 border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">Version #{ver.version_number}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(ver.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{ver.previous_title}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{ver.editor?.full_name || 'Staff User'}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No previous revisions recorded yet. Versions are automatically archived whenever title or body text is modified.
              </div>
            )}
          </div>

          {/* Version Detail Viewer (8 cols) */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-4">
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                    Snapshot from {formatDate(selectedVersion.created_at)}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 mt-1">{selectedVersion.previous_title}</h4>
                </div>

                <div className="text-xs font-semibold text-slate-400 uppercase">Archived Body Text</div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                  {selectedVersion.previous_body}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Select a revision to inspect its previous contents.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default VersionHistoryModal;

