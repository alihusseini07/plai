import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandWordmark from '@/components/BrandWordmark';
import { storeAuthSession } from '@/lib/account';

export default function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode === 'signup' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        // Backend is reachable — show its error, never fall through to mock.
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong');
        return;
      }
      const data = await res.json();
      storeAuthSession(data.token, data.user || { name, email });
      navigate('/dashboard');
    } catch {
      // TEMPORARY MOCK — remove once backend auth is stable.
      // Only reaches here when fetch itself throws (backend unreachable).
      // A real error response from the backend exits above via the !res.ok branch.
      storeAuthSession('mock_token_dev', { name: name || email.split('@')[0], email });
      navigate('/dashboard');
      // END TEMPORARY MOCK
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <BrandWordmark logoClassName="h-14 w-auto" />
          <p className="text-sm text-neutral-400">play music with your hands</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">Welcome</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Log in or create an account to continue.
            </p>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Choose mode"
            className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-lg border border-neutral-800 bg-neutral-950"
          >
            <TabButton selected={mode === 'login'} onClick={() => setMode('login')}>
              Log in
            </TabButton>
            <TabButton selected={mode === 'signup'} onClick={() => setMode('signup')}>
              Sign up
            </TabButton>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'signup' && (
              <Field
                id="name"
                label="Name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={setName}
                autoComplete="name"
              />
            )}
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />

            <button
              type="submit"
              disabled={loading || !email || !password || (mode === 'signup' && !name)}
              className="w-full h-10 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </button>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          By continuing you agree to use your camera for hand tracking.
        </p>
      </div>
    </div>
  );
}

function TabButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={
        'h-9 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
        (selected
          ? 'bg-neutral-800 text-white'
          : 'text-neutral-400 hover:text-white')
      }
    >
      {children}
    </button>
  );
}

function Field({ id, label, type, placeholder, value, onChange, autoComplete }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full h-10 px-3 rounded-md border border-neutral-700 bg-neutral-950 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-colors"
      />
    </div>
  );
}
