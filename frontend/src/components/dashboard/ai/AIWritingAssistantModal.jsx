import React, { useState } from 'react';
import api from '../../../api/client';
import { 
  Sparkles, 
  X, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeftRight,
  Wand2,
  Minimize2,
  Maximize2,
  CheckCheck
} from 'lucide-react';

export const AIWritingAssistantModal = ({ isOpen, onClose, originalText = '', onApply }) => {
  const [inputText, setInputText] = useState(originalText);
  const [selectedInstruction, setSelectedInstruction] = useState('improve_writing');
  const [customTone, setCustomTone] = useState('professional');
  const [improvedResult, setImprovedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickActions = [
    { id: 'fix_grammar', label: 'Fix Grammar & Spelling', icon: CheckCheck },
    { id: 'improve_writing', label: 'Improve Flow & Clarity', icon: Wand2 },
    { id: 'rewrite', label: 'Rewrite Text', icon: RefreshCw },
    { id: 'simplify', label: 'Simplify Language', icon: Wand2 },
    { id: 'make_professional', label: 'Make Professional', icon: Sparkles },
    { id: 'shorten', label: 'Shorten & Condense', icon: Minimize2 },
    { id: 'expand', label: 'Expand & Elaborate', icon: Maximize2 },
    { id: 'change_tone', label: 'Change Tone', icon: Sparkles },
  ];

  const handleImprove = async (instructionToUse = selectedInstruction) => {
    if (!inputText.trim()) {
      setError('Please provide text to improve.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/improve', {
        text: inputText.trim(),
        instruction: instructionToUse,
        tone: customTone
      });

      if (res.data.success) {
        setImprovedResult(res.data.data);
      } else {
        setError(res.data.error || 'Failed to improve text.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI Assistant is currently unavailable. You can continue managing your content manually.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (improvedResult?.improved) {
      onApply(improvedResult.improved);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 text-purple-300 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Writing Assistant
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Compare & Accept
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Fix grammar, refine tone, shorten or expand text with side-by-side verification before applying.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Pills Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center gap-2 overflow-x-auto">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => {
                setSelectedInstruction(action.id);
                handleImprove(action.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedInstruction === action.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </button>
          ))}

          {selectedInstruction === 'change_tone' && (
            <select
              value={customTone}
              onChange={(e) => {
                setCustomTone(e.target.value);
                handleImprove('change_tone');
              }}
              className="px-2 py-1 text-xs border border-purple-300 rounded-lg bg-white text-purple-900 font-semibold focus:outline-none"
            >
              <option value="professional">Professional</option>
              <option value="conversational & friendly">Friendly & Conversational</option>
              <option value="authoritative & executive">Executive & Authoritative</option>
              <option value="witty & engaging">Engaging & Lively</option>
              <option value="academic & technical">Technical & Academic</option>
            </select>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Error Alert */}
          {Boolean(error) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error))}</p>
                <p className="mt-1 text-amber-700">
                  You can continue typing and formatting your content manually.
                </p>
              </div>
            </div>
          )}

          {/* Comparison View (Original vs Improved) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Text Box */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Original Text</span>
                <span className="text-[11px] text-slate-400 font-mono">{inputText.length} chars</span>
              </div>
              <textarea
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter or paste text to refine..."
                className="w-full flex-1 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              ></textarea>
            </div>

            {/* Improved Text Box */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  AI Improved Version
                </span>
                {improvedResult && (
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Ready to Apply
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex-1 min-h-[250px] p-6 rounded-2xl bg-purple-50/40 border border-purple-200 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-purple-900">Applying AI improvements...</p>
                  <p className="text-[11px] text-slate-500">Refining vocabulary and sentence structure</p>
                </div>
              ) : improvedResult ? (
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="flex-1 p-4 rounded-2xl border border-purple-200 bg-white text-xs text-slate-800 font-mono leading-relaxed overflow-y-auto max-h-[350px]">
                    {improvedResult.improved}
                  </div>

                  {improvedResult.changes_summary && (
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-900">
                      <strong>Summary of changes:</strong> {improvedResult.changes_summary}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 min-h-[250px] p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2 text-center text-slate-400">
                  <Wand2 className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No suggestions generated yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Choose one of the quick actions above (e.g. "Fix Grammar" or "Make Professional") to preview improvements.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            * Content will only be replaced when you click "Accept & Apply". Existing text is never overwritten automatically.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Reject / Keep Original
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!improvedResult?.improved}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Accept & Apply Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIWritingAssistantModal;

