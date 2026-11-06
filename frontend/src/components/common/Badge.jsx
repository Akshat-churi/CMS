import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Published
        </span>
      );
    case 'pending_review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Pending Review
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Rejected
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Draft
        </span>
      );
  }
};

export const RoleBadge = ({ role }) => {
  switch (role) {
    case 'admin':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
          Admin
        </span>
      );
    case 'editor':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
          Editor
        </span>
      );
    case 'author':
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
          Author
        </span>
      );
  }
};

export const ContentTypeBadge = ({ type }) => {
  const styles = {
    article: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    news: 'bg-sky-50 text-sky-700 border-sky-200',
    announcement: 'bg-amber-50 text-amber-700 border-amber-200',
    event: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
  };

  const labels = {
    article: 'Article',
    news: 'News',
    announcement: 'Announcement',
    event: 'Event'
  };

  const style = styles[type] || styles.article;
  const label = labels[type] || 'Content';

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${style}`}>
      {label}
    </span>
  );
};

