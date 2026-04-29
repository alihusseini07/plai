import React from 'react';
import { Link } from 'react-router-dom';
import BrandWordmark from './BrandWordmark.jsx';

export default function AppHeader({ backTo, children }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 bg-neutral-950 border-b border-neutral-800">
      <div className="flex items-center gap-4">
        {backTo && (
          <Link
            to={backTo}
            aria-label="Back to dashboard"
            className="inline-flex items-center justify-center w-8 h-8 -ml-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-white hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-sm"
          aria-label="plai — go to dashboard"
        >
          <BrandWordmark />
        </Link>
      </div>

      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </header>
  );
}
