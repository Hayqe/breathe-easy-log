import { Link, useLocation } from 'react-router-dom';
import { Wind, Plus, History, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            <span className="text-lg font-light tracking-wide">Astma Logger</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
              {user?.display_name}
            </span>
            <Button variant="ghost" size="icon" onClick={logout} title="Uitloggen">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container py-4 pb-20 md:pb-4">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div className="flex">
          <Link
            to="/"
            className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Plus className="h-5 w-5" />
            Nieuw log
          </Link>
          <Link
            to="/history"
            className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors ${
              location.pathname === '/history' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <History className="h-5 w-5" />
            Geschiedenis
          </Link>
        </div>
      </nav>
    </div>
  );
}
