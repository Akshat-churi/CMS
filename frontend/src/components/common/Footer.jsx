import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Globe, Share2, Mail, ArrowUpRight, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Top Newsletter / Dispatch Band */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400">
              The Daily Editorial Dispatch
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              Get peer-reviewed architecture & engineering analyses in your inbox.
            </h3>
            <p className="text-sm text-slate-400">
              Curated by senior editors and verified contributors. Zero spam, unsubscribe anytime.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2.5 px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>You are subscribed to The Daily Dispatch!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your work email address..."
                  className="px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-slate-400 border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm backdrop-blur w-full sm:w-72"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-2xl text-white tracking-tight">
                  CONTENTPILOT
                </span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest -mt-0.5">
                  The Editorial Technology Review
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              An independent, digital publication covering software engineering, distributed systems, digital typography, and digital publishing governance. Powered by ContentPilot AI CMS.
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" aria-label="Website" className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Social Share" className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="mailto:editors@contentpilot.ai" aria-label="Email" className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Section 1: Editorial Sections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Publication</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/articles" className="hover:text-white transition-colors">Longform Features</Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-white transition-colors">Newsroom Wire</Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-white transition-colors">Official Bulletins</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">Summits & Events</Link>
              </li>
              <li>
                <Link to="/articles?sort=oldest" className="hover:text-white transition-colors">Archive & History</Link>
              </li>
            </ul>
          </div>

          {/* Section 2: Standards & About */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Standards & Masthead</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About the Dispatch</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Editorial Ethics</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Verification Process</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Pitch an Article</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Editorial Desk</Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Staff Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Editorial Workspace</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For accredited authors, editors, and platform administrators.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all shadow-sm"
              >
                <span>Staff CMS Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Editorial Pipeline: Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal / Copyright Strip */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ContentPilot AI. All rights reserved. Professional Editorial Edition.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-white transition-colors">Editorial Standards</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
