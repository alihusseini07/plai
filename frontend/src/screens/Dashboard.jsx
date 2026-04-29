import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('plai_token');
    navigate('/');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-lg font-semibold tracking-tight">plai</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </header>

      <main className="flex flex-col items-center gap-10 px-4 py-16">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <InstrumentButton label="Piano" onClick={() => navigate('/play/piano')} />
          <InstrumentButton label="Drums" onClick={() => navigate('/play/drums')} />
        </div>

        <section className="w-full max-w-sm">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Recent sessions
          </h2>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function InstrumentButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 h-32 rounded-lg border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}
