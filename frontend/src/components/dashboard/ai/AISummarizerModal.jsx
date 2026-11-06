import React, { useState } from 'react';
import api from '../../../api/client';
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  ListOrdered,
  ArrowRight
} from 'lucide-react';

export const AISummarizerModal = ({ isOpen, onClose, text = '', contentType = 'article', onInsertDescription }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState(null);

  if (!isOpen) return null;

  const handleSummarize = async () => {
    if (!text || !text.trim()) {
      setError('Please provide content text to summarize.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/summarize', {
        text,
        content_type: contentType
      });

      if (res.data.success) {
        setSummaryData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to summarize content.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content, sectionKey) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/30 border border-sky-400/40 text-sky-300 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Content Summarizer
              </h3>
              <p className="text-xs text-slate-300">
                Generate executive takeaways, one-line hooks, and bullet point highlights.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <p className="mt-1 text-amber-700">
                  You can craft your excerpts or summaries manually at any time.
                </p>
              </div>
            </div>
          )}

          {!summaryData && !loading && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-4">
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Click below to synthesize the current article into a one-liner, short paragraph, and structured key takeaways.
              </p>
              <button
                type="button"
                onClick={handleSummarize}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Article Summary
              </button>
            </div>
          )}

          {loading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-900">Synthesizing key insights...</p>
            </div>
          )}

          {summaryData && (
            <div className="space-y-5">
              
              {/* One-Line Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">One-Line Hook</span>
                  <div className="flex items-center gap-1.5">
                    {onInsertDescription && (
                      <button
                        type="button"
                        onClick={() => {
                          onInsertDescription(summaryData.one_line_summary);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
                      >
                        Use as Excerpt
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(summaryData.one_line_summary, 'one_line')}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Copy"
                    >
                      {copiedSection === 'one_line' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed italic">
                  "{summaryData.one_line_summary}"
                </p>
              </div>

              {/* Short Paragraph */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">Short Executive Paragraph</span>
                  <div className="flex items-center gap-1.5">
                    {onInsertDescription && (
                      <button
                        type="button"
                        onClick={() => {
                          onInsertDescription(summaryData.short_paragraph);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
                      >
                        Use as Excerpt
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(summaryData.short_paragraph, 'paragraph')}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Copy"
                    >
                      {copiedSection === 'paragraph' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {summaryData.short_paragraph}
                </p>
              </div>

              {/* Key Points */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">Key Points & Takeaways</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(summaryData.key_points?.map(p => `• ${p}`).join('\n'), 'points')}
                    className="p-1 text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px]"
                  >
                    {copiedSection === 'points' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'points' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {summaryData.key_points?.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
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

export default AISummarizerModal;

