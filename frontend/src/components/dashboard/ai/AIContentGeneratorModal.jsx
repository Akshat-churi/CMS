import React, { useState } from 'react';
import api from '../../../api/client';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  SlidersHorizontal 
} from 'lucide-react';

export const AIContentGeneratorModal = ({ isOpen, onClose, onInsert, initialType = 'article' }) => {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState(initialType);
  const [targetAudience, setTargetAudience] = useState('Industry Professionals & General Readers');
  const [writingTone, setWritingTone] = useState('professional');
  const [contentLength, setContentLength] = useState('medium');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or prompt for the AI to write about.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/generate', {
        topic: topic.trim(),
        content_type: contentType,
        target_audience: targetAudience,
        writing_tone: writingTone,
        content_length: contentLength
      });

      if (res.data.success) {
        setGeneratedResult(res.data.data);
      } else {
        setError(res.data.error || 'AI generation failed.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedResult) {
      onInsert({
        title: generatedResult.title,
        description: generatedResult.description,
        body: generatedResult.full_html || generatedResult.main_content,
        contentType: contentType
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Content Generator
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Phase 2 Assistant
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Generate complete editorial drafts with structured sections, headlines, and excerpts.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Error Alert */}
          {Boolean(error) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error))}</p>
                <p className="mt-1 text-amber-700">
                  ContentPilot works independently: you can close this window and draft your content manually at any time.
                </p>
              </div>
            </div>
          )}

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Topic (Left 7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Content Topic or Key Ideas <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The impact of edge computing on global CDN performance, latency improvements, and architectural considerations for enterprise media platforms..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Senior Software Engineers, Product Directors, General Readers"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Options (Right 5 cols) */}
            <div className="md:col-span-5 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="article">Article (Longform)</option>
                  <option value="news">News Update</option>
                  <option value="announcement">Official Announcement</option>
                  <option value="event">Event / Summit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Writing Tone
                </label>
                <select
                  value={writingTone}
                  onChange={(e) => setWritingTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="professional">Professional</option>
                  <option value="informative">Informative & Analytical</option>
                  <option value="friendly">Friendly & Engaging</option>
                  <option value="formal">Formal & Corporate</option>
                  <option value="creative">Creative & Visionary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Desired Content Length
                </label>
                <select
                  value={contentLength}
                  onChange={(e) => setContentLength(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="short">Short (~300 - 500 words)</option>
                  <option value="medium">Medium (~600 - 900 words)</option>
                  <option value="long">Long & In-Depth (~1000 - 1500 words)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {generatedResult ? 'Regenerate Content' : 'Generate Full Draft'}
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Generated Draft Preview
                </span>
                <span className="text-[11px] text-slate-400">
                  Ready to insert into editor as draft
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Headline</span>
                  <h4 className="text-lg font-bold text-slate-900">{generatedResult.title}</h4>
                </div>

                {generatedResult.description && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Excerpt / Short Description</span>
                    <p className="text-xs text-slate-600 italic">{generatedResult.description}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Formatted Content Body</span>
                  <div
                    className="prose prose-slate max-w-none text-xs text-slate-700 max-h-64 overflow-y-auto p-4 bg-white rounded-xl border border-slate-200 font-serif leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: generatedResult.full_html || generatedResult.main_content }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            * Generated content will be loaded into the editor as an editable draft. It is never published automatically.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!generatedResult}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Insert into Editor
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIContentGeneratorModal;

