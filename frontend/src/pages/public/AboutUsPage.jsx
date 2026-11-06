import React from 'react';
import { Compass, ShieldCheck, Users, Layers, Award, CheckCircle2, ArrowRight, BookOpen, Terminal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUsPage = () => {
  const mastheadMembers = [
    {
      name: 'Elena Rostova',
      role: 'Editor-in-Chief',
      desk: 'Systems Architecture & Editorial Direction',
      bio: 'Former principal engineer and contributing editor with 14 years covering distributed infrastructure and language compilers.'
    },
    {
      name: 'Marcus Vance',
      role: 'Senior Technical Editor',
      desk: 'Database Systems & Cloud Reliability',
      bio: 'Specialist in PostgreSQL internals, cloud infrastructure optimization, and reactive publication architectures.'
    },
    {
      name: 'Aria Chen',
      role: 'Staff Architecture Writer',
      desk: 'Full-Stack Frameworks & API Standards',
      bio: 'Author of widespread research on React concurrency, modern UI rendering engines, and developer ergonomics.'
    },
    {
      name: 'David Okafor',
      role: 'Standards & Verification Director',
      desk: 'Compliance & Audit Integrity',
      bio: 'Directs editorial governance, accuracy audits, peer verification pipelines, and publication security standards.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      
      {/* Editorial Masthead Hero */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          The ContentPilot Editorial Manifesto
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-black text-slate-950 tracking-tight leading-[1.1]">
          Rigorous journalism for the engineering age.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 font-light leading-relaxed">
          ContentPilot AI is an independent technical journal and modern publishing platform engineered to bridge creative authoring with strict enterprise editorial governance.
        </p>
      </div>

      {/* Core Editorial Pillars (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-slate-900">Human Verification First</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-light">
            Every submission undergoes rigorous review by editors. Automated AI tools serve exclusively as advisory writing copilots — human stewards retain total control over publishing.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-slate-900">Immutable Version Audits</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-light">
            Every headline update, body edit, or retraction creates a permanent revision snapshot in our database. Complete accountability is engineered directly into our data schema.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-slate-900">Zero-Dependency Reliability</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-light">
            ContentPilot operates seamlessly regardless of third-party AI service status or rate quotas. The CMS core, database pipeline, and public journal are 100% autonomous.
          </p>
        </div>

      </div>

      {/* Editorial Standards Statement */}
      <div className="bg-slate-950 text-white p-10 sm:p-14 rounded-3xl shadow-2xl space-y-8">
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
            Publishing Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
            Our Code of Editorial Integrity
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300 text-sm leading-relaxed font-light">
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base font-serif">1. Factual Verification & Reproducibility</h4>
            <p>
              Technical claims, benchmark figures, and architectural patterns are vetted for reproducibility before publication. Code snippets and schema designs are reviewed by engineering staff.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base font-serif">2. Author Independence & Attribution</h4>
            <p>
              Contributing authors maintain full editorial rights over their drafts. Editorial suggestions are made transparently through our review workflow without covert rewriting.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base font-serif">3. AI Transparency</h4>
            <p>
              When authors utilize our AI writing assistant, the outputs must be verified and approved by the author before submission. Automated generation is never pushed to live feeds directly.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base font-serif">4. Public Accountability</h4>
            <p>
              Corrections, clarifications, and post-publication updates are documented via timestamped change notes in content version history accessible by platform editors.
            </p>
          </div>
        </div>
      </div>

      {/* The Editorial Masthead Board */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            The Editorial Board & Masthead
          </h2>
          <p className="text-xs text-slate-500 mt-1">The stewards responsible for editorial curation and standards verification.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mastheadMembers.map((member, i) => (
            <div key={i} className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-lg text-slate-900">{member.name}</h4>
                  <p className="text-xs font-bold text-indigo-600">{member.role}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
                  {member.name.charAt(0)}
                </div>
              </div>
              <p className="text-xs font-mono text-slate-400">{member.desk}</p>
              <p className="text-xs text-slate-600 leading-relaxed font-light">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action: Pitch or Register */}
      <div className="bg-gradient-to-r from-indigo-50 to-slate-100 p-10 rounded-3xl border border-indigo-200/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-2xl text-slate-900">Interested in Contributing?</h3>
          <p className="text-xs text-slate-600 max-w-md">
            Join our accredited contributor network. Registered authors can submit technical drafts directly to our review desk.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-all"
          >
            Contact Desk
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
          >
            Join as Author
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AboutUsPage;
