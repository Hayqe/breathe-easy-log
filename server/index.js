import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import fetch from 'node-fetch';

const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const AQICN_TOKEN = process.env.AQICN_TOKEN || '';

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Auth routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'E-mail en wachtwoord (min. 8 tekens) zijn vereist' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
      [email.toLowerCase(), hash, display_name || email.split('@')[0]]
    );
    const user = result.rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-mailadres is al in gebruik' });
    console.error(err);
    res.status(500).json({ error: 'Registratie mislukt' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Ongeldig e-mailadres of wachtwoord' });
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Inloggen mislukt' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, display_name FROM users WHERE id = $1', [req.userId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fout bij ophalen gebruiker' });
  }
});

// --- Logs routes ---
app.get('/api/logs', auth, async (req, res) => {
  try {
    const { from, to, min_severity } = req.query;
    let query = 'SELECT * FROM asthma_logs WHERE user_id = $1';
    const params = [req.userId];
    let i = 2;

    if (from) { query += ` AND created_at >= $${i++}`; params.push(from); }
    if (to) { query += ` AND created_at <= $${i++}::date + interval '1 day'`; params.push(to); }
    if (min_severity) { query += ` AND severity >= $${i++}`; params.push(min_severity); }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Logs ophalen mislukt' });
  }
});

app.post('/api/logs', auth, async (req, res) => {
  try {
    const { latitude, longitude, location_name, complaints_text, severity, aqi_value, temperature, humidity, aqi_category } = req.body;
    if (!latitude || !longitude || !severity) {
      return res.status(400).json({ error: 'Locatie en ernst zijn vereist' });
    }
    const result = await pool.query(
      `INSERT INTO asthma_logs (user_id, latitude, longitude, location_name, complaints_text, severity, aqi_value, temperature, humidity, aqi_category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.userId, latitude, longitude, location_name, complaints_text, severity, aqi_value, temperature, humidity, aqi_category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Log opslaan mislukt' });
  }
});

// --- Air quality route ---
app.get('/api/air-quality', auth, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat en lng zijn vereist' });

    const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${AQICN_TOKEN}`);
    const data = await response.json();

    if (data.status !== 'ok') {
      return res.status(502).json({ error: 'Luchtkwaliteit ophalen mislukt' });
    }

    const iaqi = data.data.iaqi || {};
    res.json({
      aqi: data.data.aqi,
      temperature: iaqi.t?.v ?? null,
      humidity: iaqi.h?.v ?? null,
      category: getAqiCategory(data.data.aqi),
    });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Luchtkwaliteit ophalen mislukt' });
  }
});

function getAqiCategory(aqi) {
  if (aqi <= 50) return 'Goed';
  if (aqi <= 100) return 'Matig';
  if (aqi <= 150) return 'Ongezond voor gevoelige groepen';
  if (aqi <= 200) return 'Ongezond';
  if (aqi <= 300) return 'Zeer ongezond';
  return 'Gevaarlijk';
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
