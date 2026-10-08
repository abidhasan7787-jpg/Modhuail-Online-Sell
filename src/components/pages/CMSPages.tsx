import React from 'react';
import { db } from '../../services/db';

interface CMSPagesProps {
  slug: string;
  onNavigate: (route: string, param?: string) => void;
}

export const CMSPages: React.FC<CMSPagesProps> = ({ slug, onNavigate }) => {
  const page = db.getCMSPageBySlug(slug) || {
    id: 'not-found',
    slug,
    title: slug.replace(/-/g, ' ').toUpperCase(),
    content: '<p>Content for this policy page is being prepared by the MJ atelier editorial team.</p>',
    last_updated: new Date().toISOString(),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-pink-600">Home</button>
        {' '}/ <span className="text-slate-800 font-semibold">{page.title}</span>
      </div>

      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          {page.title}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Last updated: {new Date(page.last_updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* HTML Content Container */}
      <div 
        className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 text-sm space-y-4"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
};
