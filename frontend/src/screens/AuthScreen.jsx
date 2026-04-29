import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function AuthScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(mode) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        // Backend is reachable — show its error, never fall through to mock.
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong');
        return;
      }
      const data = await res.json();
      localStorage.setItem('plai_token', data.token);
      navigate('/dashboard');
    } catch {
      // TEMPORARY MOCK — remove once backend auth is stable.
      // Only reaches here when fetch itself throws (backend unreachable).
      // A real error response from the backend exits above via the !res.ok branch.
      localStorage.setItem('plai_token', 'mock_token_dev');
      navigate('/dashboard');
      // END TEMPORARY MOCK
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">plai</h1>
          <p className="text-sm text-muted-foreground">play music with your hands</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="login" className="flex-1">Log in</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <AuthForm
                email={email}
                password={password}
                onEmail={setEmail}
                onPassword={setPassword}
                onSubmit={() => handleSubmit('login')}
                loading={loading}
                label="Log in"
              />
            </TabsContent>

            <TabsContent value="signup">
              <AuthForm
                email={email}
                password={password}
                onEmail={setEmail}
                onPassword={setPassword}
                onSubmit={() => handleSubmit('register')}
                loading={loading}
                label="Create account"
              />
            </TabsContent>
          </Tabs>

          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AuthForm({ email, password, onEmail, onPassword, onSubmit, loading, label }) {
  return (
    <div className="space-y-3">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => onEmail(e.target.value)}
        autoComplete="email"
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => onPassword(e.target.value)}
        autoComplete="current-password"
      />
      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={loading || !email || !password}
      >
        {loading ? 'Loading…' : label}
      </Button>
    </div>
  );
}
