import React, { useState, useEffect } from 'react';
import api from '../../../api/client';
import { Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export const AIAvailabilityBanner = ({ onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/status');
      if (res.data.success) {
        setStatus(res.data);
        if (onStatusChange) onStatusChange(res.data.available);
      }
    } catch (err) {
      const fallback = { available: false, message: 'AI Assistant is currently unavailable. You can continue managing your content manually.' };
      setStatus(fallback);
      if (onStatusChange) onStatusChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-500 animate-pulse">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-400" />
          Checking AI Assistant availability...
        </span>
      </div>
    );
  }

  if (!status?.available) {
    return (
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">
              AI Assistant is currently unavailable. You can continue managing your content manually.
            </p>
            <p className="text-amber-700 mt-0.5">
              To enable AI content generation, writing assistance, and SEO recommendations, configure <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-900 font-mono">AI_API_KEY</code> in <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-900 font-mono">backend/.env</code>.
            </p>
          </div>
        </div>
        <button
          onClick={checkStatus}
          className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-amber-100/70 text-amber-800 rounded-xl border border-amber-300 font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>
          <strong>AI Assistant Online:</strong> Powered by <strong>{status.model}</strong> ({status.provider}). All features are active.
        </span>
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Ready
      </span>
    </div>
  );
};

export default AIAvailabilityBanner;

