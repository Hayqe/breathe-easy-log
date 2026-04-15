export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface AsthmaLog {
  id: string;
  user_id: string;
  created_at: string;
  latitude: number;
  longitude: number;
  location_name: string;
  complaints_text: string;
  severity: number;
  aqi_value: number | null;
  temperature: number | null;
  humidity: number | null;
  aqi_category: string | null;
}

export interface AirQualityData {
  aqi: number;
  temperature: number | null;
  humidity: number | null;
  category: string;
}

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}
