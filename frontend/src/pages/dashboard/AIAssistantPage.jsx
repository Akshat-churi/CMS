import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import AIAvailabilityBanner from '../../components/dashboard/ai/AIAvailabilityBanner';
import { 
  Sparkles, 
  Wand2, 
  Globe, 
  FileText, 
  FileSearch, 
  Check, 
  Copy, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';

export const AIAssistantPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'writing' | 'seo' | 'summarizer' | 'reviewer'
  const [isAiAvailable, setIsAiAvailable] = useState(true);

  // 1. Generator State
  const [genTopic, setGenTopic] = useState('');
  const [genType, setGenType] = useState('article');
  const [genAudience, setGenAudience] = useState('Technology & Business Professionals');
  const [genTone, setGenTone] = useState('professional');
  const [genLength, setGenLength] = useState('medium');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [genResult, setGenResult] = useState(null);

  // 2. Writing Assistant State
  const [writeText, setWriteText] = useState('');
  const [writeAction, setWriteAction] = useState('improve_writing');
  const [writeTone, setWriteTone] = useState('professional');
  const [writeLoading, setWriteLoading] = useState(false);
  const [writeError, setWriteError] = useState('');
  const [writeResult, setWriteResult] = useState(null);

  // 3. SEO Assistant State
  const [seoInputTitle, setSeoInputTitle] = useState('');
  const [seoInputBody, setSeoInputBody] = useState('');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState('');
  const [seoResult, setSeoResult] = useState(null);

  // 4. Summarizer State
  const [sumText, setSumText] = useState('');
  const [sumLoading, setSumLoading] = useState(false);
  const [sumError, setSumError] = useState('');
  const [sumResult, setSumResult] = useState(null);

  // 5. Reviewer State
  const [revTitle, setRevTitle] = useState('');
  const [revBody, setRevBody] = useState('');
  const [revType, setRevType] = useState('article');
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState('');
  const [revResult, setRevResult] = useState(null);

  const [copiedId, setCopiedId] = useState(null);
  const copyText = (val, id) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generator Call
  const handleGenerate = async () => {
    if (!genTopic.trim()) {
      setGenError('Please enter a topic to generate content.');
      return;
    }
    try {
      setGenLoading(true);
      setGenError('');
      const res = await api.post('/ai/generate', {
        topic: genTopic,
        content_type: genType,
        target_audience: genAudience,
        writing_tone: genTone,
        content_length: genLength
      });
      if (res.data.success) {
        setGenResult(res.data.data);
      }
    } catch (err) {
      setGenError(err.response?.data?.error || 'AI Assistant is currently unavailable. You can continue managing your content manually.');
    } finally {
      setGenLoading(false);
    }
  };

  // Writing Call
  const handleImproveWriting = async (actionToUse = writeAction) => {
    if (!writeText.trim()) {
      setWriteError('Please provide text to improve.');
      return;
    }
    try {
      setWriteLoading(true);
      setWriteError('');
      const res = await api.post('/ai/improve', {
        text: writeText,
        instruction: actionToUse,
        tone: writeTone
      });
      if (res.data.success) {
        setWriteResult(res.data.data);
      }
    } catch (err) {
      setWriteError(err.response?.data?.error || 'AI Assistant is currently unavailable. You can continue managing your content manually.');
    } finally {
      setWriteLoading(false);
    }
  };

  // SEO Call
  const handleGenerateSeo = async () => {
    if (!seoInputTitle.trim() && !seoInputBody.trim()) {
      setSeoError('Please provide a title or content body to analyze for SEO.');
      return;
    }
    try {
      setSeoLoading(true);
      setSeoError('');
      const res = await api.post('/ai/seo', {
        title: seoInputTitle,
        body: seoInputBody
      });
      if (res.data.success) {
        setSeoResult(res.data.data);
      }
    } catch (err) {
      setSeoError(err.response?.data?.error || 'AI Assistant is currently unavailable. You can continue managing your content manually.');
    } finally {
      setSeoLoading(false);
    }
  };

  // Summarize Call
  const handleSummarize = async () => {
    if (!sumText.trim()) {
      setSumError('Please provide content to summarize.');
      return;
    }
    try {
      setSumLoading(true);
      setSumError('');
      const res = await api.post('/ai/summarize', { text: sumText });
      if (res.data.success) {
        setSumResult(res.data.data);
      }
    } catch (err) {
      setSumError(err.response?.data?.error || 'AI Assistant is currently unavailable. You can continue managing your content manually.');
    } finally {
      setSumLoading(false);
    }
  };

  // Review Call
  const handleReview = async () => {
    if (!revBody.trim()) {
      setRevError('Please provide content body text to review.');
      return;
    }
    try {
      setRevLoading(true);
      setRevError('');
      const res = await api.post('/ai/review', {
        title: revTitle,
        body: revBody,
        content_type: revType
      });
      if (res.data.success) {
        setRevResult(res.data.data);
      }
    } catch (err) {
      setRevError(err.response?.data?.error || 'AI Assistant is currently unavailable. You can continue managing your content manually.');
    } finally {
      setRevLoading(false);
    }
  };

  const tabs = [
    { id: 'generator', label: 'Content Generator', icon: Sparkles },
    { id: 'writing', label: 'Writing Assistant', icon: Wand2 },
    { id: 'seo', label: 'SEO Assistant', icon: Globe },
    { id: 'summarizer', label: 'Summarizer', icon: FileText },
    { id: 'reviewer', label: 'Content Reviewer', icon: FileSearch },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Title & Availability */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>AI Editorial Studio</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Phase 2
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Assisted content drafting, grammar optimization, metadata engineering, and pre-publication diagnostic audits.
            </p>
          </div>
        </div>

        {/* Global Availability Banner */}
        <AIAvailabilityBanner onStatusChange={setIsAiAvailable} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-xs font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CONTENT GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Generate Draft Article</h3>
            
            {genError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{genError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Topic / Brief</label>
                <textarea
                  rows={4}
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Next-generation content caching architectures with edge functions and Supabase RLS..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Content Type</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="article">Article (Longform)</option>
                  <option value="news">News Update</option>
                  <option value="announcement">Announcement</option>
                  <option value="event">Event / Summit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Audience</label>
                <input
                  type="text"
                  value={genAudience}
                  onChange={(e) => setGenAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tone</label>
                  <select
                    value={genTone}
                    onChange={(e) => setGenTone(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="informative">Informative</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Length</label>
                  <select
                    value={genLength}
                    onChange={(e) => setGenLength(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="short">Short (~400w)</option>
                    <option value="medium">Medium (~750w)</option>
                    <option value="long">Long (~1200w)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={genLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {genLoading ? 'Generating Structured Draft...' : 'Generate Content'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="text-xs font-bold text-slate-900 uppercase">Generated Draft</span>
                {genResult && (
                  <button
                    onClick={() => {
                      // Navigate to create page with state
                      navigate('/dashboard/content/create', {
                        state: {
                          initialTitle: genResult.title,
                          initialDescription: genResult.description,
                          initialBody: genResult.full_html || genResult.main_content,
                          initialType: genType
                        }
                      });
                    }}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5"
                  >
                    Load into Content Editor <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {genResult ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Generated Title</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{genResult.title}</h4>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Summary Excerpt</span>
                    <p className="text-xs text-slate-600 italic mt-0.5">{genResult.description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">HTML Content</span>
                    <div
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-96 overflow-y-auto prose prose-slate text-xs font-serif leading-relaxed mt-1"
                      dangerouslySetInnerHTML={{ __html: genResult.full_html || genResult.main_content }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 text-xs space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Configure topic parameters on the left and click "Generate Content".</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 pt-4 border-t border-slate-100">
              * Generated content is inserted as a draft. It is never published automatically.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WRITING ASSISTANT */}
      {/* ========================================================================= */}
      {activeTab === 'writing' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Refine & Enhance Text</h3>
              <p className="text-xs text-slate-500">Fix grammar, improve readability, or adapt writing tone.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'fix_grammar', label: 'Fix Grammar' },
                { id: 'improve_writing', label: 'Improve Flow' },
                { id: 'simplify', label: 'Simplify' },
                { id: 'make_professional', label: 'Make Professional' },
                { id: 'shorten', label: 'Shorten' },
                { id: 'expand', label: 'Expand' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setWriteAction(opt.id);
                    handleImproveWriting(opt.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    writeAction === opt.id
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {writeError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{writeError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Input Text</span>
                <span className="text-[11px] text-slate-400">{writeText.length} chars</span>
              </div>
              <textarea
                rows={12}
                value={writeText}
                onChange={(e) => setWriteText(e.target.value)}
                placeholder="Paste or write draft sentences here to improve grammar, tone, or readability..."
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Improved Output
                </span>
                {writeResult && (
                  <button
                    onClick={() => copyText(writeResult.improved, 'write')}
                    className="text-[11px] font-semibold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    {copiedId === 'write' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'write' ? 'Copied' : 'Copy Result'}
                  </button>
                )}
              </div>

              {writeLoading ? (
                <div className="h-64 rounded-2xl bg-purple-50/40 border border-purple-200 flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-purple-900">Refining text...</p>
                </div>
              ) : writeResult ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-purple-200 bg-white text-xs font-mono text-slate-800 min-h-[200px] overflow-y-auto leading-relaxed">
                    {writeResult.improved}
                  </div>
                  {writeResult.changes_summary && (
                    <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 border border-purple-100">
                      <strong>Changes:</strong> {writeResult.changes_summary}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-2">
                  <Wand2 className="w-8 h-8 text-slate-300" />
                  <p>Input text and choose an enhancement action above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SEO ASSISTANT */}
      {/* ========================================================================= */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analyze Content for SEO</h3>
            
            {seoError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{seoError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Working Title</label>
                <input
                  type="text"
                  value={seoInputTitle}
                  onChange={(e) => setSeoInputTitle(e.target.value)}
                  placeholder="e.g. Modern Web Architecture with Supabase"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Article Body / Excerpt</label>
                <textarea
                  rows={8}
                  value={seoInputBody}
                  onChange={(e) => setSeoInputBody(e.target.value)}
                  placeholder="Paste article body text to extract high-relevance search keywords and meta descriptions..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleGenerateSeo}
                disabled={seoLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {seoLoading ? 'Optimizing Metadata...' : 'Generate SEO Metadata'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              SEO Optimization Recommendations
            </h3>

            {seoResult ? (
              <div className="space-y-4 text-xs">
                {/* Title */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">Optimized SEO Title</span>
                    <button
                      onClick={() => copyText(seoResult.seo_title, 'seo_title')}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedId === 'seo_title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-bold text-slate-900">{seoResult.seo_title}</p>
                </div>

                {/* Description */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">Meta Description</span>
                    <button
                      onClick={() => copyText(seoResult.meta_description, 'seo_desc')}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedId === 'seo_desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{seoResult.meta_description}</p>
                </div>

                {/* Keywords */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 uppercase text-[10px]">Suggested Keywords</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(seoResult.keywords_array || seoResult.keywords?.split(',') || []).map((k, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold text-[11px]">
                        {k.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {seoResult.recommendations?.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">Ranking Recommendations</span>
                    <ul className="space-y-1.5 list-disc pl-4 text-slate-600 text-xs">
                      {seoResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs space-y-2">
                <Globe className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Provide content details on the left and click "Generate SEO Metadata".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUMMARIZER */}
      {/* ========================================================================= */}
      {activeTab === 'summarizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Summarize Article</h3>
            
            {sumError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{sumError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Content Text</label>
              <textarea
                rows={12}
                value={sumText}
                onChange={(e) => setSumText(e.target.value)}
                placeholder="Paste article text here to produce one-line, paragraph, and bullet-point summaries..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              ></textarea>
            </div>

            <button
              type="button"
              onClick={handleSummarize}
              disabled={sumLoading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {sumLoading ? 'Synthesizing Content...' : 'Summarize Content'}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Structured Summaries
            </h3>

            {sumResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">One-Line Summary</span>
                    <button onClick={() => copyText(sumResult.one_line_summary, 'sum_one')} className="text-slate-400 hover:text-slate-700">
                      {copiedId === 'sum_one' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-semibold text-slate-800 italic">"{sumResult.one_line_summary}"</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">Executive Paragraph</span>
                    <button onClick={() => copyText(sumResult.short_paragraph, 'sum_para')} className="text-slate-400 hover:text-slate-700">
                      {copiedId === 'sum_para' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{sumResult.short_paragraph}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 uppercase text-[10px]">Key Takeaways</span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {sumResult.key_points?.map((pt, i) => (
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
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Paste text on the left and click "Summarize Content".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CONTENT REVIEWER */}
      {/* ========================================================================= */}
      {activeTab === 'reviewer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Submit for AI Quality Check</h3>
            
            {revError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{revError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Headline / Title</label>
                <input
                  type="text"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="Draft article title..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Article Body</label>
                <textarea
                  rows={8}
                  value={revBody}
                  onChange={(e) => setRevBody(e.target.value)}
                  placeholder="Paste article body text to review for grammar, repetition, clarity, and safety..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleReview}
                disabled={revLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {revLoading ? 'Auditing Content Quality...' : 'Run Editorial Audit'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Audit Feedback & Recommendations
              </h3>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Advisory Only
              </span>
            </div>

            {revResult ? (
              <div className="space-y-4 text-xs">
                {/* Score */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Quality Score</span>
                    <p className="text-xs text-slate-300 mt-0.5">{revResult.verdict_summary}</p>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 shrink-0">
                    {revResult.overall_score || 85} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>

                {/* Safety & Grammar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">Policy Safety</span>
                    <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {revResult.content_safety?.passed !== false ? 'Passed Safety Guidelines' : 'Review Needed'}
                    </p>
                    <p className="text-[11px] text-slate-500">{revResult.content_safety?.notes}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">Grammar Findings</span>
                    <p className="text-xs text-slate-700">
                      {revResult.grammar_issues?.length ? `${revResult.grammar_issues.length} suggested fixes` : 'No grammatical issues found.'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {revResult.recommendations?.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 uppercase text-[10px]">Editorial Improvement Recommendations</span>
                    <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                      {revResult.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs space-y-2">
                <FileSearch className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Submit content on the left to run editorial quality review.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AIAssistantPage;

