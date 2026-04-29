import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountMenu from '@/components/AccountMenu';
import AppHeader from '@/components/AppHeader';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  changeCurrentPassword,
  clearAuthSession,
  deleteCurrentUser,
  fetchCurrentUser,
  getStoredUser,
  updateCurrentUser,
} from '@/lib/account';

export default function AccountScreen({ section = 'profile' }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    avatarDataUrl: user?.avatarDataUrl || null,
  }));
  const [profileStatus, setProfileStatus] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    let active = true;
    const fallbackUser = getStoredUser();

    fetchCurrentUser()
      .then((nextUser) => {
        if (!active) return;
        setUser(nextUser);
        setProfileForm({
          name: nextUser.name || '',
          email: nextUser.email || '',
          avatarDataUrl: nextUser.avatarDataUrl || null,
        });
      })
      .catch(() => {
        if (!active) return;

        if (fallbackUser) {
          setUser(fallbackUser);
          setProfileForm({
            name: fallbackUser.name || '',
            email: fallbackUser.email || '',
            avatarDataUrl: fallbackUser.avatarDataUrl || null,
          });
          setProfileStatus('Profile details are using local data until the backend account route responds.');
          return;
        }

        clearAuthSession();
        navigate('/', { replace: true });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const cards = useMemo(() => {
    return section === 'settings'
      ? ['settings', 'profile']
      : ['profile', 'settings'];
  }, [section]);

  async function handleProfileSave(event) {
    event.preventDefault();
    setProfileStatus('');
    setSavingProfile(true);

    try {
      const nextUser = await updateCurrentUser(profileForm);
      setUser(nextUser);
      setProfileForm({
        name: nextUser.name,
        email: nextUser.email,
        avatarDataUrl: nextUser.avatarDataUrl,
      });
      setProfileStatus('Profile updated.');
    } catch (err) {
      setProfileStatus(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1_500_000) {
      setProfileStatus('Profile picture must be under 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((current) => ({ ...current, avatarDataUrl: reader.result }));
      setProfileStatus('');
    };
    reader.readAsDataURL(file);
  }

  async function handlePasswordSave(event) {
    event.preventDefault();
    setPasswordStatus('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await changeCurrentPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus('Password updated.');
    } catch (err) {
      setPasswordStatus(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount(event) {
    event.preventDefault();
    setDeleteStatus('');
    setDeletingAccount(true);

    try {
      await deleteCurrentUser(deletePassword);
      clearAuthSession();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteStatus(err.message);
      setDeletingAccount(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <AppHeader backTo="/dashboard">
        <AccountMenu />
      </AppHeader>

      <main className="flex-1 px-6 py-12 sm:py-14">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <section className="space-y-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Account
              </h1>
              <p className="mt-2 text-base text-neutral-400">
                Manage your profile, security, and account details.
              </p>
            </div>

            <div className="flex gap-2">
              <SectionLink to="/profile" active={section === 'profile'} icon={<UserTabIcon />}>
                Profile
              </SectionLink>
              <SectionLink to="/settings" active={section === 'settings'} icon={<SettingsTabIcon />}>
                Settings
              </SectionLink>
            </div>
          </section>

          {loading ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-8 text-sm text-neutral-400">
              Loading account details…
            </div>
          ) : (
            cards.map((card) => (
              <React.Fragment key={card}>
                {card === 'profile' ? (
                  <Card className="border-neutral-800 bg-neutral-900">
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Update your name, email, and profile picture.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileSave} className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <ProfileAvatar user={profileForm} className="h-20 w-20" textClassName="text-xl" />
                          <div className="flex flex-wrap gap-3">
                            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                              Upload photo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                              />
                            </label>
                            {profileForm.avatarDataUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setProfileForm((current) => ({ ...current, avatarDataUrl: null }))}
                              >
                                Remove photo
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Name">
                            <Input
                              value={profileForm.name}
                              onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                              placeholder="Your name"
                              required
                            />
                          </Field>
                          <Field label="Email">
                            <Input
                              type="email"
                              value={profileForm.email}
                              onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                              placeholder="you@example.com"
                              required
                            />
                          </Field>
                        </div>

                        {profileStatus && (
                          <p className={`text-sm ${profileStatus.endsWith('.') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {profileStatus}
                          </p>
                        )}

                        <Button type="submit" disabled={savingProfile}>
                          {savingProfile ? 'Saving…' : 'Save profile'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                    <Card className="border-neutral-800 bg-neutral-900">
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Change your password.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePasswordSave} className="space-y-4">
                          <Field label="Current password">
                            <Input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                              required
                            />
                          </Field>
                          <Field label="New password">
                            <Input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                              required
                            />
                          </Field>
                          <Field label="Confirm new password">
                            <Input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                              required
                            />
                          </Field>

                          {passwordStatus && (
                            <p className={`text-sm ${passwordStatus.endsWith('.') ? 'text-emerald-400' : 'text-red-400'}`}>
                              {passwordStatus}
                            </p>
                          )}

                          <Button type="submit" disabled={savingPassword}>
                            {savingPassword ? 'Updating…' : 'Change password'}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card className="border-red-950 bg-neutral-900">
                      <CardHeader>
                        <CardTitle>Delete account</CardTitle>
                        <CardDescription>This permanently removes your account and saved sessions.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                          <Field label="Confirm password">
                            <Input
                              type="password"
                              value={deletePassword}
                              onChange={(event) => setDeletePassword(event.target.value)}
                              required
                            />
                          </Field>

                          {deleteStatus && (
                            <p className="text-sm text-red-400">{deleteStatus}</p>
                          )}

                          <Button type="submit" variant="destructive" disabled={deletingAccount}>
                            {deletingAccount ? 'Deleting…' : 'Delete account'}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-white">{label}</span>
      {children}
    </label>
  );
}

function SectionLink({ to, active, icon, children }) {
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
        active
          ? 'border-indigo-500 bg-indigo-500/15 text-white'
          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white',
      ].join(' ')}
    >
      {icon}
      {children}
    </Link>
  );
}

function UserTabIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-6 7a6 6 0 1112 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SettingsTabIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 3.5l1.3 1.1 1.7-.2.9 1.4 1.6.6-.1 1.7 1.1 1.2-1.1 1.2.1 1.7-1.6.6-.9 1.4-1.7-.2L10 16.5l-1.3-1.1-1.7.2-.9-1.4-1.6-.6.1-1.7L3.5 10l1.1-1.2-.1-1.7 1.6-.6.9-1.4 1.7.2L10 3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
