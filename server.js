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

const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploads folder statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Read DB
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { products: [], posts: [] };
  }
}

// Write DB
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  db.products = req.body;
  writeDB(db);
  res.json({ success: true });
});

// --- POSTS ---
app.get('/api/posts', (req, res) => {
  const db = readDB();
  res.json(db.posts || []);
});

app.post('/api/posts', (req, res) => {
  const db = readDB();
  db.posts = req.body;
  writeDB(db);
  res.json({ success: true });
});

// --- UPLOAD ---
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// --- CONTACT FORM ---
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

  const gmailUser = envVars['GMAIL_USER'];
  const gmailPass = envVars['GMAIL_APP_PASSWORD'];

  if (!gmailUser || !gmailPass || gmailPass === 'your_app_password_here') {
    // Email not configured — still save inquiry to db.json and return 200
    const db = readDB();
    db.inquiries = db.inquiries || [];
    db.inquiries.push({ id: Date.now().toString(), name, email, subject, message, receivedAt: new Date().toISOString() });
    writeDB(db);
    return res.json({ success: true, mode: 'saved', message: 'Inquiry saved. Configure GMAIL_APP_PASSWORD in .env to also receive emails.' });
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
            <p style="margin:0;font-size:11px;color:#999;">Sent via Chamrud Enterprise website · sales.chamrud@gmail.com</p>
          </div>
        </div>
      `,
    });

    // Also save to db
    const db = readDB();
    db.inquiries = db.inquiries || [];
    db.inquiries.push({ id: Date.now().toString(), name, email, subject, message, receivedAt: new Date().toISOString() });
    writeDB(db);

    res.json({ success: true, mode: 'email' });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. Check GMAIL_APP_PASSWORD in .env.' });
  }
});

const PORT = 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
server.ref();
const keepAlive = setInterval(() => {}, 1 << 30);
server.on('close', () => clearInterval(keepAlive));
