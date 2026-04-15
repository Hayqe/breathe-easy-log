

## Astma Klachten Logger - Implementatieplan

### Design Thema: "Lucht"
Gebaseerd op de geuploadde foto: zacht hemelblauw kleurenpalet met lage contrasten, maar voldoende leesbaar. Dunne sans-serif font (Inter Thin/Light met medium voor body-tekst voor leesbaarheid).

**Kleurenpalet (HSL):**
- Background: zacht wit-blauw (`200 40% 97%`)
- Foreground: gedempd donkerblauw (`210 25% 30%`) - laag contrast maar leesbaar
- Primary: hemelblauw (`200 60% 55%`)
- Cards: semi-transparant wit met glaseffect (backdrop-blur)
- Accenten: zachte gradienten van lucht naar wolkenwit

**Font:** Inter (light 300 voor headings, regular 400 voor body)

### 1. Database & Authenticatie (Supabase/Lovable Cloud)
- **Auth:** Email/wachtwoord via Supabase Auth (bcrypt-gehasht, beveiligd)
- **profiles** tabel: `id (uuid, FK auth.users)`, `display_name`, `created_at`
- **asthma_logs** tabel: `id`, `user_id (FK)`, `created_at`, `latitude`, `longitude`, `location_name`, `complaints_text`, `severity (1-5)`, `aqi_value`, `temperature`, `humidity`, `aqi_category`
- **RLS policies:** gebruikers kunnen alleen eigen data lezen/schrijven
- Trigger voor automatisch profiel aanmaken bij registratie

### 2. Pagina's & Componenten
- `/login` - Login/registratie formulier
- `/` - Nieuw log invoeren (hoofdscherm, mobiel-geoptimaliseerd)
  - GPS-knop + OpenStreetMap Nominatim zoekveld
  - Leaflet mini-kaart
  - AQICN data-card (AQI, temp, vochtigheid)
  - Sterren 1-5, tekstveld, opslaan
- `/history` - Geschiedenis met filters (datum, ernst) en Recharts grafieken

### 3. AQICN API
- Supabase Edge Function om AQICN API key veilig te houden
- Endpoint: `/functions/v1/get-air-quality?lat=...&lng=...`
- Retourneert AQI, temperatuur, luchtvochtigheid

### 4. Docker Deployment
- `Dockerfile`: multi-stage build (Node build -> nginx serve)
- `docker-compose.yml`: frontend service met environment variabelen voor Supabase URL + anon key
- nginx config voor SPA routing (alle routes -> index.html)
- Supabase URL/key als build-time env vars via `.env` file

```text
docker-compose.yml
├── frontend (nginx:alpine)
│   ├── Build: Vite -> static files
│   └── Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### 5. Responsive Design
- Mobile-first: volledige breedte cards, grote touch targets
- Tablet/desktop: max-width container, 2-koloms layout voor geschiedenis
- Glasmorphism-effect op cards (backdrop-blur, semi-transparante achtergrond)

### Volgorde van implementatie
1. Design systeem (kleuren, fonts, glaseffect utilities)
2. Supabase setup (tabellen, RLS, auth)
3. Auth pagina (login/registratie)
4. Log-invoer pagina met locatie + AQICN integratie
5. Edge Function voor AQICN API
6. Geschiedenis pagina met filters en grafieken
7. Dockerfile + docker-compose.yml
8. AQICN API key als secret opslaan

