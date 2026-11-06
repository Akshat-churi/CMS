import React, { useState } from 'react';
import api from '../../../api/client';
import { 
  ShieldCheck, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  ShieldAlert, 
  RefreshCw,
  FileSearch,
  Check
} from 'lucide-react';

export const AIReviewModal = ({ isOpen, onClose, title = '', body = '', contentType = 'article' }) => {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRunReview = async () => {
    if (!body || !body.trim()) {
      setError('Please ensure there is content in the article body to review.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/review', {
        title,
        body,
        content_type: contentType
      });

      if (res.data.success) {
        setReviewData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to complete review.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Editorial Content Reviewer
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Advisory Only
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Automated multi-point inspection for grammar, clarity, repetition, and editorial safety.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Human Governance Notice */}
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900 font-medium">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Human Governance Policy:</strong> This AI review is purely diagnostic and provides recommendations. Final content approval, rejection, and publishing decisions remain strictly with human Editors and Administrators.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Error Alert */}
          {Boolean(error) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error))}</p>
                <p className="mt-1 text-amber-700">
                  You can proceed with manual editorial checks or submit directly for human review.
                </p>
              </div>
            </div>
          )}

          {/* Trigger Initial Run if empty */}
          {!reviewData && !loading && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <FileSearch className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Run Editorial Quality Audit</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  The AI Reviewer will scan "{title || 'this content'}" for sentence clarity, grammatical correctness, structural repetition, and tone alignment.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunReview}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Analyze Content Quality Now
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-900">Analyzing editorial quality...</p>
              <p className="text-xs text-slate-500">Checking clarity, grammar, repetition, and safety compliance</p>
            </div>
          )}

          {/* Review Results */}
          {reviewData && (
            <div className="space-y-6">
              
              {/* Score & Verdict Banner */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Overall Quality Score</span>
                  <p className="text-sm text-slate-300 leading-snug">{reviewData.verdict_summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                    {reviewData.overall_score || 85}
                  </div>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Grid of Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Grammar Check */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">Grammar & Syntax</span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {reviewData.grammar_issues?.length || 0} items
                    </span>
                  </div>
                  {reviewData.grammar_issues?.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {reviewData.grammar_issues.map((g, i) => (
                        <div key={i} className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
                          <p className="font-semibold text-rose-900">{g.issue}</p>
                          <p className="text-emerald-700 mt-1"><strong>Fix:</strong> {g.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> No grammar issues detected.
                    </p>
                  )}
                </div>

                {/* Clarity Check */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">Clarity & Readability</span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {reviewData.clarity_issues?.length || 0} alerts
                    </span>
                  </div>
                  {reviewData.clarity_issues?.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {reviewData.clarity_issues.map((c, i) => (
                        <div key={i} className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                          <p className="font-mono text-[11px] text-slate-700 italic">"{c.sentence}"</p>
                          <p className="text-amber-800 mt-1"><strong>Note:</strong> {c.problem}</p>
                          <p className="text-indigo-700 mt-0.5"><strong>Suggestion:</strong> {c.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Sentences are clear and well-structured.
                    </p>
                  )}
                </div>

                {/* Content Safety Check */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">Content Policy & Safety</span>
                  <div className={`p-3 rounded-xl border text-xs ${
                    reviewData.content_safety?.passed !== false
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <p className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {reviewData.content_safety?.passed !== false ? 'Passed Safety Guidelines' : 'Potential Safety Concern'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">{reviewData.content_safety?.notes}</p>
                  </div>
                </div>

                {/* Repetition & Missing Info */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">Information Depth & Redundancy</span>
                  {reviewData.missing_info?.length > 0 ? (
                    <ul className="text-xs space-y-1.5 list-disc pl-4 text-slate-600">
                      {reviewData.missing_info.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No critical information gaps identified.</p>
                  )}
                </div>

              </div>

              {/* Actionable Recommendations */}
              {reviewData.recommendations?.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recommended Editorial Next Steps
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {reviewData.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRunReview}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-run Analysis
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Close Review Report
          </button>
        </div>

      </div>
    </div>
  );
};

export default AIReviewModal;

