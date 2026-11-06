import React, { useState } from 'react';
import api from '../../api/client';
import { Mail, MapPin, Phone, Send, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, MessageSquare, Newspaper, Shield, Sparkles } from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', category: 'editorial', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', category: 'editorial', message: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How do I pitch or register as a contributing technical author?',
      a: 'Anyone can register for a contributor account via the Register portal. All new accounts receive the Author role by default, granting access to our rich text content editor, AI writing assistant, and draft submission queue.'
    },
    {
      q: 'Can authors publish articles directly to the public website?',
      a: 'No. Under ContentPilot editorial governance, authors save drafts and submit them for review. Only accredited Editors or Administrators can approve and publish content, ensuring strict verification and quality standards.'
    },
    {
      q: 'What editorial guidelines must technical essays meet?',
      a: 'Submissions should explore real-world architectures, code patterns, systems benchmarks, or engineering design decisions. AI tools may be used as drafting assistance, but all claims and code must be authored or verified by the human contributor.'
    },
    {
      q: 'How does the content revision and version history system work?',
      a: 'Every update to a published title or article body automatically creates an immutable version snapshot in our PostgreSQL database. Editors can review prior revisions, audit timestamps, and restore historical copy if needed.'
    },
    {
      q: 'What happens if external AI providers are offline or disconnected?',
      a: 'ContentPilot core CMS is 100% autonomous and has zero hard dependency on external AI APIs. Manual authoring, drafts, media uploads, review queues, approvals, and public feeds operate with zero interruption.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          Editorial Desk & Inquiries
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-950 tracking-tight leading-[1.1]">
          Contact the Editorial Desk
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
          Submit article pitches, request editorial corrections, coordinate press syndication, or contact our systems engineering team.
        </p>
      </div>

      {/* Main Grid: Form (7 cols) + Direct Inquiries (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Send a Dispatch or Inquiry</h2>
            <p className="text-xs text-slate-500">Our editorial desk reviews messages daily and responds within 24 hours.</p>
          </div>

          {submitted && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3.5 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dispatch Received!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Thank you! Your message has been logged in our editorial pipeline. A staff editor will reply to your provided address.
                </p>
              </div>
            </div>
          )}

          {Boolean(error) && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {typeof error === 'string' ? error : (error?.message || error?.code || JSON.stringify(error))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@organization.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Inquiry Department
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-900 transition-all cursor-pointer"
                >
                  <option value="editorial">Editorial Pitch or Essay</option>
                  <option value="press">Press & Media Release</option>
                  <option value="correction">Editorial Correction / Errata</option>
                  <option value="partnership">Academic / Industry Partnership</option>
                  <option value="general">General Platform Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary of inquiry"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Message Body
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Include your pitch abstract, background details, or request..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-900 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-950 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Transmitting Dispatch...</span>
              ) : (
                <>
                  <span>Transmit to Editorial Desk</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Editorial Channels & Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                Direct Desks
              </span>
              <h3 className="text-2xl font-serif font-black text-white">Editorial Offices</h3>
              <p className="text-xs text-slate-400">Accredited correspondence channels</p>
            </div>

            <div className="space-y-5 text-sm text-slate-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">Editorial Desk</p>
                  <p className="text-slate-300 text-xs">editors@contentpilot.ai</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pitches, essay submissions, technical queries</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-sky-400">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">Press & Syndication</p>
                  <p className="text-slate-300 text-xs">press@contentpilot.ai</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Media kits, interview requests, republishing</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">Newsroom Headquarters</p>
                  <p className="text-slate-300 text-xs">555 Mission Street, Suite 2400</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase">
              <Shield className="w-4 h-4" />
              <span>Editorial Response SLA</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              All contributor pitches receive formal acknowledgment within 24 hours. Approved drafts enter the peer verification and editorial review pipeline.
            </p>
          </div>

        </div>

      </div>

      {/* Interactive FAQ Accordion */}
      <div className="space-y-6 pt-10 border-t border-slate-200">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Common questions regarding editorial submission, governance, and platform architecture.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif font-bold text-base text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-light">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ContactPage;
