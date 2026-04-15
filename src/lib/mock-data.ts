import type { User, AsthmaLog, AirQualityData } from '@/types';

export const MOCK_USER: User = {
  id: 'mock-user-001',
  email: 'demo@astmalogger.nl',
  display_name: 'Demo Gebruiker',
};

export const MOCK_LOGS: AsthmaLog[] = [
  {
    id: 'log-001', user_id: 'mock-user-001', created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    latitude: 52.3676, longitude: 4.9041, location_name: 'Amsterdam Centrum',
    complaints_text: 'Benauwdheid bij het fietsen, hoesten', severity: 4,
    aqi_value: 78, temperature: 18, humidity: 72, aqi_category: 'Matig',
  },
  {
    id: 'log-002', user_id: 'mock-user-001', created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    latitude: 52.0907, longitude: 5.1214, location_name: 'Utrecht, Domtoren',
    complaints_text: 'Lichte piepende ademhaling', severity: 2,
    aqi_value: 42, temperature: 20, humidity: 65, aqi_category: 'Goed',
  },
  {
    id: 'log-003', user_id: 'mock-user-001', created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    latitude: 51.9225, longitude: 4.4792, location_name: 'Rotterdam, Erasmusbrug',
    complaints_text: 'Druk op de borst, kortademig na wandeling', severity: 3,
    aqi_value: 95, temperature: 16, humidity: 80, aqi_category: 'Matig',
  },
  {
    id: 'log-004', user_id: 'mock-user-001', created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    latitude: 52.3792, longitude: 4.8994, location_name: 'Amsterdam Noord',
    complaints_text: 'Geen klachten vandaag', severity: 1,
    aqi_value: 30, temperature: 22, humidity: 55, aqi_category: 'Goed',
  },
  {
    id: 'log-005', user_id: 'mock-user-001', created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    latitude: 51.4416, longitude: 5.4697, location_name: 'Eindhoven Centrum',
    complaints_text: 'Ernstige benauwdheid, noodmedicatie gebruikt', severity: 5,
    aqi_value: 162, temperature: 28, humidity: 45, aqi_category: 'Ongezond voor gevoelige groepen',
  },
  {
    id: 'log-006', user_id: 'mock-user-001', created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    latitude: 52.2215, longitude: 6.8937, location_name: 'Enschede, Volkspark',
    complaints_text: 'Lichte hoest, niezen', severity: 2,
    aqi_value: 55, temperature: 19, humidity: 70, aqi_category: 'Matig',
  },
  {
    id: 'log-007', user_id: 'mock-user-001', created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    latitude: 53.2194, longitude: 6.5665, location_name: 'Groningen, Grote Markt',
    complaints_text: 'Piepende ademhaling bij inspanning', severity: 3,
    aqi_value: 68, temperature: 14, humidity: 78, aqi_category: 'Matig',
  },
  {
    id: 'log-008', user_id: 'mock-user-001', created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    latitude: 51.8126, longitude: 5.8372, location_name: 'Nijmegen, Waalkade',
    complaints_text: '', severity: 1,
    aqi_value: 25, temperature: 21, humidity: 60, aqi_category: 'Goed',
  },
];

export function getMockAirQuality(_lat: number, _lng: number): AirQualityData {
  return {
    aqi: 52 + Math.floor(Math.random() * 40),
    temperature: 15 + Math.floor(Math.random() * 10),
    humidity: 55 + Math.floor(Math.random() * 25),
    category: 'Matig',
  };
}

let _isMockMode: boolean | null = null;

export async function checkMockMode(): Promise<boolean> {
  if (_isMockMode !== null) return _isMockMode;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/health`, { signal: controller.signal });
    clearTimeout(timer);
    _isMockMode = !res.ok;
  } catch {
    _isMockMode = true;
  }
  return _isMockMode;
}

export function isMockMode(): boolean {
  return _isMockMode ?? true;
}

export function setMockMode(val: boolean) {
  _isMockMode = val;
}
