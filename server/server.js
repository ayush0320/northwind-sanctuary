const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const DATA_FILE = path.join(__dirname, '..', 'data', 'enquiries.json');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

// Only needed when the frontend is hosted elsewhere (e.g. GitHub Pages)
if (process.env.ALLOWED_ORIGIN) {
  app.use('/api', (req, res, next) => {
    res.set({
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    req.method === 'OPTIONS' ? res.sendStatus(204) : next();
  });
}

app.use(express.static(path.join(__dirname, '..', 'public')));

// Simple JSON-file storage; writes are queued so they never overlap
let queue = Promise.resolve();
async function load() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, 'utf8')); } catch { return []; }
}
function save(entry) {
  const run = queue.then(async () => {
    const all = await load();
    all.push(entry);
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2));
  });
  queue = run.catch(() => {});
  return run;
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const clean = (v) => String(v ?? '').trim();

app.post('/api/contact', limiter, async (req, res) => {
  const b = req.body || {};
  const name = clean(b.name).slice(0, 100);
  const mobile = clean(b.mobile).replace(/[\s-]/g, '');
  const email = clean(b.email).slice(0, 120);
  const message = clean(b.message).slice(0, 1000);

  if (name.length < 2) return res.status(400).json({ error: 'Please enter your full name.' });
  if (!/^\+?\d{10,13}$/.test(mobile)) return res.status(400).json({ error: 'Please enter a valid mobile number.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  try {
    await save({
      id: crypto.randomUUID(),
      name, mobile, email, message,
      newsletter: b.newsletter === true,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save your enquiry. Please try again.' });
  }
});

// Admin: list enquiries (send the ADMIN_KEY in the x-admin-key header)
app.get('/api/enquiries', async (req, res) => {
  const key = req.get('x-admin-key') || '';
  const ok = ADMIN_KEY && key.length === ADMIN_KEY.length &&
    crypto.timingSafeEqual(Buffer.from(key), Buffer.from(ADMIN_KEY));
  if (!ok) return res.status(401).json({ error: 'Unauthorized' });
  res.json((await load()).reverse());
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => res.status(err.status || 500).json({ error: 'Invalid request' }));

app.listen(PORT, () => console.log(`Northwind Sanctuary running on http://localhost:${PORT}`));
