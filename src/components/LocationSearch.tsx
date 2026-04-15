import { useState, useCallback } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { NominatimResult } from '@/types';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const useGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          onLocationSelect(latitude, longitude, data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          onLocationSelect(latitude, longitude, `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setGpsLoading(false);
        }
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true }
    );
  }, [onLocationSelect]);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full glass"
        onClick={useGPS}
        disabled={gpsLoading}
      >
        {gpsLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <MapPin className="h-4 w-4 mr-2" />
        )}
        Gebruik huidige locatie
      </Button>

      <div className="flex gap-2">
        <Input
          placeholder="Zoek locatie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
          className="glass"
        />
        <Button type="button" variant="outline" size="icon" onClick={search} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="glass rounded-lg divide-y divide-border overflow-hidden">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                onClick={() => {
                  onLocationSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                  setResults([]);
                  setQuery('');
                }}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
