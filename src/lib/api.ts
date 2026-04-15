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

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: import('../types').User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, display_name: string) =>
      request<{ token: string; user: import('../types').User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name }),
      }),
    me: () => request<import('../types').User>('/auth/me'),
  },
  logs: {
    list: (params?: { from?: string; to?: string; min_severity?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.from) searchParams.set('from', params.from);
      if (params?.to) searchParams.set('to', params.to);
      if (params?.min_severity) searchParams.set('min_severity', String(params.min_severity));
      const qs = searchParams.toString();
      return request<import('../types').AsthmaLog[]>(`/logs${qs ? `?${qs}` : ''}`);
    },
    create: (log: Omit<import('../types').AsthmaLog, 'id' | 'user_id' | 'created_at'>) =>
      request<import('../types').AsthmaLog>('/logs', {
        method: 'POST',
        body: JSON.stringify(log),
      }),
  },
  airQuality: {
    get: (lat: number, lng: number) =>
      request<import('../types').AirQualityData>(`/air-quality?lat=${lat}&lng=${lng}`),
  },
};
