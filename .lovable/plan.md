

## Mock-modus + Instellingenpagina

### 1. Mock-modus voor preview
Voegt een automatische fallback toe zodat de app werkt zonder backend.

**`src/lib/mock-data.ts`** — Bevat:
- Mock-gebruiker (testgebruiker met email/naam)
- 8-10 voorbeeld asthma-logs met variërende data
- Mock luchtkwaliteitsdata

**`src/lib/api.ts` aanpassen** — Detecteert of de backend bereikbaar is. Zo niet: alle API-calls retourneren mockdata. Login/register werken met elke invoer.

**`src/context/AuthContext.tsx` aanpassen** — In mock-modus: slaat nep-token op, zet mock-user.

**Visuele indicator** — Kleine "Demo modus" badge in de header.

### 2. Instellingenpagina (`/settings`)

**Wachtwoord wijzigen:**
- Formulier met huidig wachtwoord, nieuw wachtwoord, bevestiging
- Validatie: minimaal 8 tekens, wachtwoorden moeten matchen
- API-call naar nieuw endpoint `PUT /api/auth/password`

**AQICN API-key opslaan:**
- Invoerveld voor persoonlijke AQICN token
- Opgeslagen per gebruiker in de database (nieuw kolom `aqicn_token` in users-tabel)
- Als de gebruiker een eigen key heeft, wordt die gebruikt i.p.v. de server-default
- API-call naar nieuw endpoint `PUT /api/settings`

### Backend wijzigingen (`server/index.js`)
- `PUT /api/auth/password` — Controleert huidig wachtwoord, hasht nieuw wachtwoord, slaat op
- `PUT /api/settings` — Slaat AQICN token op voor de gebruiker
- `GET /api/settings` — Haalt huidige instellingen op
- Air-quality endpoint: gebruikt user-token als die er is, anders server-default

### Database wijziging (`server/init.sql`)
- `aqicn_token` kolom toevoegen aan users-tabel

### Navigatie
- Tandwiel-icoon in de header (naast uitlog-knop)
- Link in mobiele bottom-nav
- Route `/settings` achter ProtectedRoute

### Bestanden
| Nieuw | Wijziging |
|-------|-----------|
| `src/lib/mock-data.ts` | `src/lib/api.ts` |
| `src/pages/Settings.tsx` | `src/context/AuthContext.tsx` |
| | `src/components/AppLayout.tsx` |
| | `src/App.tsx` |
| | `server/index.js` |
| | `server/init.sql` |

