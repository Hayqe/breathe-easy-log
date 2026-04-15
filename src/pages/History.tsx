import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { History as HistoryIcon, Filter, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';
import type { AsthmaLog } from '@/types';
import { AppLayout } from '@/components/AppLayout';
import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function History() {
  const [logs, setLogs] = useState<AsthmaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minSeverity, setMinSeverity] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.logs.list({
        from: fromDate || undefined,
        to: toDate || undefined,
        min_severity: minSeverity ? parseInt(minSeverity) : undefined,
      });
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const chartData = [...logs]
    .reverse()
    .map((log) => ({
      date: format(new Date(log.created_at), 'd MMM', { locale: nl }),
      ernst: log.severity,
      aqi: log.aqi_value,
    }));

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-primary" />
              Geschiedenis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {logs.length} logs
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="glass"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="glass rounded-lg p-4 space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Van</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tot</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Minimale ernst</Label>
              <Select value={minSeverity} onValueChange={setMinSeverity}>
                <SelectTrigger><SelectValue placeholder="Alle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <SelectItem key={v} value={String(v)}>{v}+ sterren</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={fetchLogs}>Toepassen</Button>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="glass rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 25% 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(210 15% 50%)" />
                <Tooltip
                  contentStyle={{
                    background: 'hsla(200, 30%, 98%, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid hsl(200 25% 88%)',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ernst"
                  stroke="hsl(200, 60%, 55%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Ernst"
                />
                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="hsl(200, 40%, 70%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="AQI"
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Log list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-light">Nog geen logs</p>
            <p className="text-sm mt-1">Begin met het loggen van je klachten</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(log.created_at), 'd MMMM yyyy, HH:mm', { locale: nl })}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {log.location_name}
                    </p>
                  </div>
                  <StarRating value={log.severity} readonly size={16} />
                </div>
                {log.complaints_text && (
                  <p className="text-sm">{log.complaints_text}</p>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {log.aqi_value !== null && <span>AQI: {log.aqi_value}</span>}
                  {log.temperature !== null && <span>{log.temperature}°C</span>}
                  {log.humidity !== null && <span>{log.humidity}%</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
