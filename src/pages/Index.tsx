import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { AirQualityData } from '@/types';
import { AppLayout } from '@/components/AppLayout';
import { LocationSearch } from '@/components/LocationSearch';
import { MiniMap } from '@/components/MiniMap';
import { AirQualityCard } from '@/components/AirQualityCard';
import { StarRating } from '@/components/StarRating';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, MapPin } from 'lucide-react';

export default function Index() {
  const { toast } = useToast();

  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [aqLoading, setAqLoading] = useState(false);
  const [severity, setSeverity] = useState(0);
  const [complaints, setComplaints] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLocationSelect = useCallback(async (lat: number, lng: number, name: string) => {
    setLocation({ lat, lng, name });
    setAqLoading(true);
    try {
      const data = await api.airQuality.get(lat, lng);
      setAirQuality(data);
    } catch {
      setAirQuality(null);
      toast({ title: 'Luchtkwaliteit kon niet worden opgehaald', variant: 'destructive' });
    } finally {
      setAqLoading(false);
    }
  }, [toast]);

  const handleSave = async () => {
    if (!location || severity === 0) {
      toast({ title: 'Vul locatie en ernst in', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await api.logs.create({
        latitude: location.lat,
        longitude: location.lng,
        location_name: location.name,
        complaints_text: complaints,
        severity,
        aqi_value: airQuality?.aqi ?? null,
        temperature: airQuality?.temperature ?? null,
        humidity: airQuality?.humidity ?? null,
        aqi_category: airQuality?.category ?? null,
      });
      toast({ title: 'Log opgeslagen!' });
      setLocation(null);
      setAirQuality(null);
      setSeverity(0);
      setComplaints('');
    } catch (err: any) {
      toast({ title: err.message || 'Opslaan mislukt', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
        <div>
          <h1 className="text-xl font-light flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Nieuw log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Geef je locatie aan en log je klachten
          </p>
        </div>

        {/* Location */}
        <section className="space-y-3">
          <Label>Locatie</Label>
          <LocationSearch onLocationSelect={handleLocationSelect} />
          {location && (
            <>
              <p className="text-sm text-muted-foreground truncate">{location.name}</p>
              <MiniMap lat={location.lat} lng={location.lng} />
            </>
          )}
        </section>

        {/* Air quality */}
        <AirQualityCard data={airQuality} loading={aqLoading} />

        {/* Severity */}
        <section className="space-y-2">
          <Label>Ernst van klachten</Label>
          <StarRating value={severity} onChange={setSeverity} />
        </section>

        {/* Complaints */}
        <section className="space-y-2">
          <Label htmlFor="complaints">Klachten omschrijving</Label>
          <Textarea
            id="complaints"
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
            placeholder="Beschrijf je klachten..."
            className="glass min-h-[100px]"
          />
        </section>

        {/* Save */}
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={saving || !location || severity === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Opslaan...' : 'Log opslaan'}
        </Button>
      </div>
    </AppLayout>
  );
}
