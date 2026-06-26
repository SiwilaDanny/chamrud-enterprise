import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Supabase credentials (server-side only — never sent to browser) ──────────
function loadEnv() {
  const envVars = {};
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...rest] = trimmed.split('=');
          envVars[key.trim()] = rest.join('=').trim();
        }
      });
    }
  } catch (_) {}
  return envVars;
}

function getSupabase() {
  const env = loadEnv();
  return {
    url: process.env.VITE_SUPABASE_URL || env['VITE_SUPABASE_URL'] || '',
    key: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || env['VITE_SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_ANON_KEY'] || '',
  };
}

function sbHeaders() {
  const { key } = getSupabase();
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

// ─── SUPABASE PROXY ENDPOINTS ─────────────────────────────────────────────────
// All data reads from the public site go through here so the Supabase
// secret key is NEVER sent to the browser.

app.get('/api/products', async (req, res) => {
  try {
    const { url } = getSupabase();
    const allProducts = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    while (hasMore) {
      const r = await fetch(`${url}/rest/v1/products?select=*&order=name.asc`, {
        headers: {
          ...sbHeaders(),
          'Range': `${from}-${to}`
        },
      });

      if (!r.ok) {
        return res.status(r.status).json({ error: await r.text() });
      }

      const data = await r.json();
      allProducts.push(...data);

      if (data.length < 1000) {
        hasMore = false;
      } else {
        from += 1000;
        to += 1000;
      }
    }

    res.json(allProducts);
  } catch (e) {
    console.error('[proxy] /api/products error:', e.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const { url } = getSupabase();
    const r = await fetch(`${url}/rest/v1/posts?select=*&order=created_at.desc`, {
      headers: sbHeaders(),
    });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    res.json(await r.json());
  } catch (e) {
    console.error('[proxy] /api/posts error:', e.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const { url } = getSupabase();
    const r = await fetch(`${url}/rest/v1/site_settings?select=*`, {
      headers: sbHeaders(),
    });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    res.json(await r.json());
  } catch (e) {
    console.error('[proxy] /api/settings error:', e.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});


// Serve legacy /uploads/ folder so existing image paths keep working
const UPLOADS_DIR = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  console.warn('Could not create uploads dir (likely read-only filesystem on Vercel)');
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Keep a minimal multer upload for the local fallback used by api.ts
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
// Data reads are proxied through /api/products, /api/posts, /api/settings above.
// This endpoint handles the contact form email relay only.
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
  }

  // Read .env manually (simple key=value parsing)
  const envVars = {};
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...rest] = trimmed.split('=');
          envVars[key.trim()] = rest.join('=').trim();
        }
      });
    }
  } catch (_) {}

  const gmailUser = process.env.GMAIL_USER || envVars['GMAIL_USER'];
  const gmailPass = process.env.GMAIL_APP_PASSWORD || envVars['GMAIL_APP_PASSWORD'];

  if (!gmailUser || !gmailPass || gmailPass === 'your_app_password_here') {
    return res.json({ success: true, mode: 'no-email', message: 'Configure GMAIL_APP_PASSWORD in .env to receive emails.' });
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"${name}" <${gmailUser}>`,
      replyTo: email,
      to: gmailUser,
      subject: subject ? `[Chamrud Website] ${subject}` : `[Chamrud Website] New Inquiry from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#003399;padding:24px;color:white;">
            <h2 style="margin:0;font-size:20px;">New Website Inquiry</h2>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px;">Chamrud Enterprise Contact Form</p>
          </div>
          <div style="padding:24px;background:#f9f9f9;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;font-size:13px;width:80px;">From:</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:13px;">Email:</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#003399;">${email}</a></td></tr>
              ${subject ? `<tr><td style="padding:8px 0;color:#666;font-size:13px;">Subject:</td><td style="padding:8px 0;">${subject}</td></tr>` : ''}
            </table>
            <div style="margin-top:20px;background:white;padding:16px;border-radius:8px;border:1px solid #e0e0e0;">
              <p style="margin:0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;">Message:</p>
              <p style="margin:8px 0 0;line-height:1.6;color:#333;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div style="padding:16px 24px;background:#f0f0f0;text-align:center;">
            <p style="margin:0;font-size:11px;color:#999;">Sent via Chamrud Enterprise website · sales@chamrud.com</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, mode: 'email' });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. Check GMAIL_APP_PASSWORD in .env.' });
  }
});

// Serve static frontend assets from react-scripts build directory
const DIST_DIR = path.join(__dirname, 'dist');
app.use(express.static(DIST_DIR));

// Catch-all to serve index.html for client-side navigation
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const PORT = 3001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('ℹ  Products & posts are now served by Supabase (see .env for credentials).');
  });
  server.ref();
  const keepAlive = setInterval(() => {}, 1 << 30);
  server.on('close', () => clearInterval(keepAlive));
}

export default app;
