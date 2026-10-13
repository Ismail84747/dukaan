import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Persistent database file location
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'vendors.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StageHistoryItem {
  stage: 'submitted' | 'doc_verification' | 'kit_preparation' | 'completed';
  timestamp: string;
  note?: string;
}

interface Vendor {
  id: string;
  regNumber: string;
  shopName: string;
  ownerName: string;
  phone: string;
  category: 'kirana' | 'food' | 'vegetable' | 'retail' | 'artisan';
  district: string;
  area: string;
  pincode: string;
  packageId: 'starter' | 'growth' | 'super';
  packageName: string;
  packagePrice: number;
  status: 'pending' | 'in_progress' | 'approved';
  stage?: 'submitted' | 'doc_verification' | 'kit_preparation' | 'completed';
  stageHistory?: StageHistoryItem[];
  assignedTo?: string;
  assignedPhone?: string;
  notificationSent?: boolean;
  createdAt: string;
  verifiedAt?: string;
}

// Initial sample vendors for rich default view if DB is brand new
const INITIAL_SAMPLE_VENDORS: Vendor[] = [
  {
    id: 'vendor_sample_1',
    regNumber: 'MV-MH-2025-1082',
    shopName: 'माऊली किराणा व जनरल स्टोअर्स',
    ownerName: 'दत्तात्रय रामभाऊ कदम',
    phone: '9822456789',
    category: 'kirana',
    district: 'पुणे (Pune)',
    area: 'शनिवार पेठ, बाजीराव रोड',
    pincode: '411030',
    packageId: 'growth',
    packageName: 'प्रगती सेतू (Growth)',
    packagePrice: 79,
    status: 'in_progress',
    stage: 'kit_preparation',
    stageHistory: [
      { stage: 'submitted', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), note: 'नोंदणी अर्ज प्राप्त झाला.' },
      { stage: 'doc_verification', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'कागदपत्र पडताळणी पूर्ण.' },
      { stage: 'kit_preparation', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), note: 'Google Maps पिन व ५★ स्टँडी तयार होत आहे.' },
    ],
    assignedTo: 'Ismail',
    assignedPhone: '9137786506',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'vendor_sample_2',
    regNumber: 'MV-MH-2025-2144',
    shopName: 'जय भवानी वडापाव व स्नॅक्स सेंटर',
    ownerName: 'सचिन विठ्ठल मोरे',
    phone: '9765123456',
    category: 'food',
    district: 'मुंबई उपनगर (Mumbai Sub)',
    area: 'स्टेशन रोड, बोरिवली पश्चिम',
    pincode: '400092',
    packageId: 'starter',
    packageName: 'आरंभ सेतू (Starter)',
    packagePrice: 29,
    status: 'approved',
    stage: 'completed',
    stageHistory: [
      { stage: 'submitted', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), note: 'नोंदणी अर्ज प्राप्त झाला.' },
      { stage: 'doc_verification', timestamp: new Date(Date.now() - 18 * 3600000).toISOString(), note: 'कागदपत्र पडताळणी पूर्ण.' },
      { stage: 'kit_preparation', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), note: 'QR स्टँडी व मॅप्स पिन तयार.' },
      { stage: 'completed', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'ऑनबोर्डिंग १००% पूर्ण व किट वाटप संपन्न.' },
    ],
    assignedTo: 'Faraz',
    assignedPhone: '7208655227',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    verifiedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

// Helper to read all vendors safely
const readVendorsFromDisk = (): Vendor[] => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SAMPLE_VENDORS, null, 2), 'utf-8');
      return INITIAL_SAMPLE_VENDORS;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    if (!raw.trim()) {
      return [];
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error reading vendors from disk:', err);
    return [];
  }
};

// Helper to write all vendors safely
const writeVendorsToDisk = (vendors: Vendor[]): void => {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(vendors, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error writing vendors to disk:', err);
  }
};

// ==========================================
// REST API Routes
// ==========================================

// GET /api/vendors - fetch all registered vendors across all devices
app.get('/api/vendors', (_req: Request, res: Response) => {
  try {
    const vendors = readVendorsFromDisk();
    vendors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read vendors' });
  }
});

// GET /api/vendors/:query - search or lookup vendor by ID, phone, or regNumber
app.get('/api/vendors/:query', (req: Request, res: Response) => {
  try {
    const q = req.params.query.trim().toLowerCase();
    const vendors = readVendorsFromDisk();
    const found = vendors.find(
      (v) =>
        v.id.toLowerCase() === q ||
        v.regNumber.toLowerCase() === q ||
        v.phone.replace(/\D/g, '') === q.replace(/\D/g, '')
    );
    if (!found) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /api/vendors - register new vendor from any device
app.post('/api/vendors', (req: Request, res: Response) => {
  try {
    const {
      shopName,
      ownerName,
      phone,
      category,
      district,
      area,
      pincode,
      packageId,
      packageName,
      packagePrice,
    } = req.body;

    if (!shopName || !ownerName || !phone) {
      return res.status(400).json({ error: 'shopName, ownerName, and phone are required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const vendors = readVendorsFromDisk();

    // Generate unique Registration Number: MV-MH-2025-XXXX
    let regNumber = '';
    while (true) {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const candidate = `MV-MH-2025-${random4}`;
      if (!vendors.some((v) => v.regNumber === candidate)) {
        regNumber = candidate;
        break;
      }
    }

    // Assign Specialist (Ismail / Faraz)
    const ismailCount = vendors.filter((v) => v.assignedTo === 'Ismail').length;
    const farazCount = vendors.filter((v) => v.assignedTo === 'Faraz').length;
    const assignedOfficer = ismailCount <= farazCount ? 'Ismail' : 'Faraz';
    const assignedPhone = assignedOfficer === 'Faraz' ? '7208655227' : '9137786506';

    const nowIso = new Date().toISOString();

    const newVendor: Vendor = {
      id: `vendor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      regNumber,
      shopName: String(shopName).trim(),
      ownerName: String(ownerName).trim(),
      phone: cleanPhone,
      category: category || 'kirana',
      district: district || 'पुणे (Pune)',
      area: String(area || '').trim(),
      pincode: String(pincode || '').trim(),
      packageId: packageId || 'growth',
      packageName: packageName || 'प्रगती सेतू (Growth)',
      packagePrice: typeof packagePrice === 'number' ? packagePrice : 79,
      status: 'pending',
      stage: 'submitted',
      stageHistory: [
        {
          stage: 'submitted',
          timestamp: nowIso,
          note: 'नोंदणी अर्ज पोर्टलवर प्राप्त झाला व नोंदणी क्रमांक जारी केला गेला.',
        },
      ],
      assignedTo: assignedOfficer,
      assignedPhone,
      createdAt: nowIso,
    };

    // Prepend new vendor to database
    vendors.unshift(newVendor);
    writeVendorsToDisk(vendors);

    console.log(`[Registration] New vendor registered: ${newVendor.shopName} (${newVendor.regNumber})`);
    res.status(201).json(newVendor);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register vendor' });
  }
});

// PATCH /api/vendors/bulk/stage - update multiple vendors simultaneously
app.patch('/api/vendors/bulk/stage', (req: Request, res: Response) => {
  try {
    const { ids, stage, note } = req.body;

    if (!Array.isArray(ids) || ids.length === 0 || !stage) {
      return res.status(400).json({ error: 'ids array and stage are required' });
    }

    const vendors = readVendorsFromDisk();
    const nowIso = new Date().toISOString();

    const stageDefaultNotes: Record<string, string> = {
      submitted: 'एकत्रित नोंदणी अर्ज प्राप्त.',
      doc_verification: 'एकत्रित कागदपत्र व व्यवसायाची माहिती पडताळणी प्रक्रियेत आहे.',
      kit_preparation: 'एकत्रित Google Maps पिन, UPI साऊंडबॉक्स व ५-स्टार रिव्ह्यू स्टँडी तयार होत आहे.',
      completed: 'एकत्रित डिजिटल किट वितरण व Google Business ऑनबोर्डिंग १००% यशस्वीरीत्या पूर्ण झाले.',
    };

    let updatedCount = 0;
    const updatedIds: string[] = [];

    for (let i = 0; i < vendors.length; i++) {
      if (ids.includes(vendors[i].id)) {
        const v = vendors[i];
        const history = v.stageHistory ? [...v.stageHistory] : [
          { stage: 'submitted', timestamp: v.createdAt, note: 'नोंदणी अर्ज प्राप्त.' },
        ];

        if (!history.some((h) => h.stage === stage)) {
          history.push({
            stage,
            timestamp: nowIso,
            note: note || stageDefaultNotes[stage] || `एकत्रित बदल: टप्पा ${stage} अपडेट केला.`,
          });
        }

        v.stage = stage;
        v.stageHistory = history;

        if (stage === 'completed') {
          v.status = 'approved';
          v.verifiedAt = nowIso;
        } else if (stage === 'doc_verification' || stage === 'kit_preparation') {
          v.status = 'in_progress';
        }

        vendors[i] = v;
        updatedCount++;
        updatedIds.push(v.id);
      }
    }

    writeVendorsToDisk(vendors);
    console.log(`[Bulk Stage Update] Updated ${updatedCount} vendors to stage: ${stage}`);
    res.json({ success: true, updatedCount, updatedIds });
  } catch (err) {
    console.error('Bulk stage update error:', err);
    res.status(500).json({ error: 'Failed to bulk update stages' });
  }
});

// PATCH /api/vendors/:id/stage - update vendor milestone stage
app.patch('/api/vendors/:id/stage', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { stage, note } = req.body;

    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' });
    }

    const vendors = readVendorsFromDisk();
    const vendorIdx = vendors.findIndex((v) => v.id === id);

    if (vendorIdx === -1) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const v = vendors[vendorIdx];
    const nowIso = new Date().toISOString();

    const stageDefaultNotes: Record<string, string> = {
      submitted: 'नोंदणी अर्ज प्राप्त.',
      doc_verification: 'कागदपत्र व व्यवसायाची माहिती पडताळणी प्रक्रियेत आहे.',
      kit_preparation: 'Google Maps पिन, UPI साऊंडबॉक्स व ५-स्टार रिव्ह्यू स्टँडी तयार होत आहे.',
      completed: 'डिजिटल किट वितरण व Google Business ऑनबोर्डिंग १००% यशस्वीरीत्या पूर्ण झाले.',
    };

    const history = v.stageHistory ? [...v.stageHistory] : [
      { stage: 'submitted', timestamp: v.createdAt, note: 'नोंदणी अर्ज प्राप्त.' },
    ];

    if (!history.some((h) => h.stage === stage)) {
      history.push({
        stage,
        timestamp: nowIso,
        note: note || stageDefaultNotes[stage] || `टप्पा ${stage} पूर्ण.`,
      });
    }

    v.stage = stage;
    v.stageHistory = history;

    if (stage === 'completed') {
      v.status = 'approved';
      v.verifiedAt = nowIso;
    } else if (stage === 'doc_verification' || stage === 'kit_preparation') {
      v.status = 'in_progress';
    }

    vendors[vendorIdx] = v;
    writeVendorsToDisk(vendors);

    console.log(`[Stage Update] ${v.shopName} stage updated to: ${stage}`);
    res.json(v);
  } catch (err) {
    console.error('Stage update error:', err);
    res.status(500).json({ error: 'Failed to update stage' });
  }
});

// DELETE /api/vendors/:id - delete a vendor
app.delete('/api/vendors/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let vendors = readVendorsFromDisk();
    const countBefore = vendors.length;
    vendors = vendors.filter((v) => v.id !== id);

    if (vendors.length === countBefore) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    writeVendorsToDisk(vendors);
    res.json({ success: true, remaining: vendors.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// ==========================================
// Frontend Serving (Dev vs Production)
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite middleware mode in Development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static assets serving in Production
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 MahaVyapaar Central Server running on http://${HOST}:${PORT}`);
    console.log(`📁 Shared database active at: ${DB_FILE}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
