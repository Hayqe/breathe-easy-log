/* Login page */
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Wind } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const { user, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center">
          <Wind className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-light tracking-wide">Astma Logger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log je klachten en luchtkwaliteit
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
          {isRegister && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Je naam"
                required={isRegister}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@voorbeeld.nl"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Even geduld...' : isRegister ? 'Registreren' : 'Inloggen'}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Al een account? Inloggen' : 'Nog geen account? Registreren'}
          </button>
        </form>
      </div>
    </div>
  );
}
