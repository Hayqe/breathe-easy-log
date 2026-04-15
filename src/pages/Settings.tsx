import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, KeyRound, Lock, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const { toast } = useToast();
  const { mockMode } = useAuth();

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // API key form
  const [aqicnToken, setAqicnToken] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    api.settings.get()
      .then((s) => setAqicnToken(s.aqicn_token || ''))
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast({ title: 'Nieuw wachtwoord moet minimaal 8 tekens zijn', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Wachtwoorden komen niet overeen', variant: 'destructive' });
      return;
    }
    setPasswordSaving(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      toast({ title: 'Wachtwoord gewijzigd!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({ title: err.message || 'Wachtwoord wijzigen mislukt', variant: 'destructive' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    try {
      await api.settings.update({ aqicn_token: aqicnToken });
      toast({ title: 'Instellingen opgeslagen!' });
    } catch (err: any) {
      toast({ title: err.message || 'Opslaan mislukt', variant: 'destructive' });
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-light flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Instellingen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Beheer je account en API-instellingen
          </p>
        </div>

        {/* Password section */}
        <section className="glass rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Wachtwoord wijzigen
          </h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Huidig wachtwoord</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nieuw wachtwoord</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimaal 8 tekens"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bevestig nieuw wachtwoord</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Herhaal nieuw wachtwoord"
              />
            </div>
            <Button
              size="sm"
              onClick={handlePasswordChange}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            >
              <Save className="h-4 w-4 mr-1" />
              {passwordSaving ? 'Opslaan...' : 'Wachtwoord wijzigen'}
            </Button>
          </div>
        </section>

        {/* API key section */}
        <section className="glass rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            AQICN API-sleutel
          </h2>
          <p className="text-xs text-muted-foreground">
            Voer je persoonlijke AQICN-token in voor luchtkwaliteitsdata.
            Verkrijgbaar via{' '}
            <a href="https://aqicn.org/data-platform/token/" target="_blank" rel="noopener noreferrer" className="underline text-primary">
              aqicn.org
            </a>.
          </p>
          {settingsLoading ? (
            <div className="h-10 bg-muted rounded animate-pulse" />
          ) : (
            <div className="space-y-3">
              <Input
                value={aqicnToken}
                onChange={(e) => setAqicnToken(e.target.value)}
                placeholder="Bijv. abc123def456..."
                type="password"
              />
              <Button
                size="sm"
                onClick={handleSettingsSave}
                disabled={settingsSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                {settingsSaving ? 'Opslaan...' : 'API-sleutel opslaan'}
              </Button>
            </div>
          )}
        </section>

        {mockMode && (
          <p className="text-xs text-center text-muted-foreground">
            Wijzigingen in demo-modus worden alleen lokaal opgeslagen.
          </p>
        )}
      </div>
    </AppLayout>
  );
}
