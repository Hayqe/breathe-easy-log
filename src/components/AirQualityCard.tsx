import { Wind, Thermometer, Droplets } from 'lucide-react';
import type { AirQualityData } from '@/types';

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return 'text-green-500';
  if (aqi <= 100) return 'text-yellow-500';
  if (aqi <= 150) return 'text-orange-500';
  if (aqi <= 200) return 'text-red-500';
  return 'text-purple-600';
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Goed';
  if (aqi <= 100) return 'Matig';
  if (aqi <= 150) return 'Ongezond voor gevoelige groepen';
  if (aqi <= 200) return 'Ongezond';
  if (aqi <= 300) return 'Zeer ongezond';
  return 'Gevaarlijk';
}

interface AirQualityCardProps {
  data: AirQualityData | null;
  loading: boolean;
}

export function AirQualityCard({ data, loading }: AirQualityCardProps) {
  if (loading) {
    return (
      <div className="glass rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glass rounded-lg p-4 animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Luchtkwaliteit</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <Wind className={`h-5 w-5 mx-auto mb-1 ${getAqiColor(data.aqi)}`} />
          <div className={`text-xl font-light ${getAqiColor(data.aqi)}`}>{data.aqi}</div>
          <div className="text-xs text-muted-foreground">AQI</div>
          <div className={`text-xs mt-0.5 ${getAqiColor(data.aqi)}`}>{getAqiLabel(data.aqi)}</div>
        </div>
        <div className="text-center">
          <Thermometer className="h-5 w-5 mx-auto mb-1 text-primary" />
          <div className="text-xl font-light">
            {data.temperature !== null ? `${data.temperature}°` : '—'}
          </div>
          <div className="text-xs text-muted-foreground">Temperatuur</div>
        </div>
        <div className="text-center">
          <Droplets className="h-5 w-5 mx-auto mb-1 text-primary" />
          <div className="text-xl font-light">
            {data.humidity !== null ? `${data.humidity}%` : '—'}
          </div>
          <div className="text-xs text-muted-foreground">Vochtigheid</div>
        </div>
      </div>
    </div>
  );
}
