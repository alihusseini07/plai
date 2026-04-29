import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileAvatar from '@/components/ProfileAvatar';
import { clearAuthSession, fetchCurrentUser, getStoredUser } from '@/lib/account';

export default function AccountMenu() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    let active = true;
    const fallbackUser = getStoredUser();

    fetchCurrentUser()
      .then((nextUser) => {
        if (active) setUser(nextUser);
      })
      .catch(() => {
        if (!active) return;

        if (fallbackUser) {
          setUser(fallbackUser);
          return;
        }

        setUser({ name: 'User', email: '' });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function handleLogout() {
    clearAuthSession();
    navigate('/');
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center rounded-full border border-neutral-800 bg-neutral-900 p-1 transition-colors hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        aria-label="Open account menu"
        aria-expanded={open}
      >
        <ProfileAvatar user={user} className="h-9 w-9" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-64 rounded-xl border border-neutral-800 bg-neutral-900 p-2 shadow-2xl">
          <div className="border-b border-neutral-800 px-3 py-3">
            <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-neutral-400">{user?.email || 'Loading…'}</p>
          </div>

          <div className="py-2">
            <MenuLink to="/profile" icon={<ProfileIcon />} onSelect={() => setOpen(false)}>
              Profile
            </MenuLink>
            <MenuLink to="/settings" icon={<SettingsIcon />} onSelect={() => setOpen(false)}>
              Settings
            </MenuLink>
          </div>

          <div className="border-t border-neutral-800 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon, onSelect, children }) {
  return (
    <Link
      to={to}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
    >
      {icon}
      {children}
    </Link>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-6 7a6 6 0 1112 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 3.5l1.3 1.1 1.7-.2.9 1.4 1.6.6-.1 1.7 1.1 1.2-1.1 1.2.1 1.7-1.6.6-.9 1.4-1.7-.2L10 16.5l-1.3-1.1-1.7.2-.9-1.4-1.6-.6.1-1.7L3.5 10l1.1-1.2-.1-1.7 1.6-.6.9-1.4 1.7.2L10 3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M8 4H5.5A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8M11 13l3-3-3-3M14 10H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
