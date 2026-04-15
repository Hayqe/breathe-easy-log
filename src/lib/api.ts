import { MOCK_USER, MOCK_LOGS, getMockAirQuality, isMockMode } from './mock-data';

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Mock storage for logs created during demo session
let mockSessionLogs: import('../types').AsthmaLog[] = [];

export const api = {
  auth: {
    login: async (email: string, _password: string) => {
      if (isMockMode()) {
        return { token: 'mock-token', user: { ...MOCK_USER, email, display_name: email.split('@')[0] } };
      }
      return request<{ token: string; user: import('../types').User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: _password }),
      });
    },
    register: async (email: string, _password: string, display_name: string) => {
      if (isMockMode()) {
        return { token: 'mock-token', user: { ...MOCK_USER, email, display_name: display_name || email.split('@')[0] } };
      }
      return request<{ token: string; user: import('../types').User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password: _password, display_name }),
      });
    },
    me: async () => {
      if (isMockMode()) return MOCK_USER;
      return request<import('../types').User>('/auth/me');
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      if (isMockMode()) {
        return { message: 'Wachtwoord gewijzigd (demo)' };
      }
      return request<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
    },
  },
  logs: {
    list: async (params?: { from?: string; to?: string; min_severity?: number }) => {
      if (isMockMode()) {
        let logs = [...MOCK_LOGS, ...mockSessionLogs].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        if (params?.from) logs = logs.filter(l => l.created_at >= params.from!);
        if (params?.to) logs = logs.filter(l => l.created_at <= params.to! + 'T23:59:59');
        if (params?.min_severity) logs = logs.filter(l => l.severity >= params.min_severity!);
        return logs;
      }
      const searchParams = new URLSearchParams();
      if (params?.from) searchParams.set('from', params.from);
      if (params?.to) searchParams.set('to', params.to);
      if (params?.min_severity) searchParams.set('min_severity', String(params.min_severity));
      const qs = searchParams.toString();
      return request<import('../types').AsthmaLog[]>(`/logs${qs ? `?${qs}` : ''}`);
    },
    create: async (log: Omit<import('../types').AsthmaLog, 'id' | 'user_id' | 'created_at'>) => {
      if (isMockMode()) {
        const newLog: import('../types').AsthmaLog = {
          ...log,
          id: `log-session-${Date.now()}`,
          user_id: MOCK_USER.id,
          created_at: new Date().toISOString(),
        };
        mockSessionLogs.push(newLog);
        return newLog;
      }
      return request<import('../types').AsthmaLog>('/logs', {
        method: 'POST',
        body: JSON.stringify(log),
      });
    },
  },
  airQuality: {
    get: async (lat: number, lng: number) => {
      if (isMockMode()) {
        // Simulate slight delay
        await new Promise(r => setTimeout(r, 500));
        return getMockAirQuality(lat, lng);
      }
      return request<import('../types').AirQualityData>(`/air-quality?lat=${lat}&lng=${lng}`);
    },
  },
  settings: {
    get: async () => {
      if (isMockMode()) {
        return { aqicn_token: localStorage.getItem('mock_aqicn_token') || '' };
      }
      return request<{ aqicn_token: string }>('/settings');
    },
    update: async (settings: { aqicn_token: string }) => {
      if (isMockMode()) {
        localStorage.setItem('mock_aqicn_token', settings.aqicn_token);
        return { message: 'Instellingen opgeslagen (demo)' };
      }
      return request<{ message: string }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
  },
};
