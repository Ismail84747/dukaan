import { Vendor, OnboardingStage } from '../types';

const LOCAL_STORAGE_KEY = 'mahavypaar_vendors_cache';
const DB_NAME = 'mahavypaar_db';
const DB_VERSION = 3;
const STORE_NAME = 'vendors';

// Helper to identify demo vendors that should not be shown
const isDemoVendor = (v: any): boolean => {
  if (!v) return true;
  if (v.isDemo) return true;
  return false;
};

// Local storage backup helpers
const getLocalBackup = (): Vendor[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => !isDemoVendor(v));
  } catch {
    return [];
  }
};

const setLocalBackup = (vendors: Vendor[]): void => {
  try {
    const clean = vendors.filter((v) => !isDemoVendor(v));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
};

// IndexedDB initialization for offline fallback
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('regNumber', 'regNumber', { unique: true });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('district', 'district', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Fetches all vendors from the central shared server database.
 * This ensures that vendors registered from any mobile, tablet, or PC
 * are immediately visible to the admin on any device!
 */
export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    const res = await fetch('/api/vendors');
    if (res.ok) {
      const serverVendors: Vendor[] = await res.json();
      const cleaned = serverVendors.filter((v) => !isDemoVendor(v));
      cleaned.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setLocalBackup(cleaned);

      // Async cache update to IndexedDB
      try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const v of cleaned) {
          store.put(v);
        }
      } catch {}

      return cleaned;
    }
  } catch (err) {
    console.warn('Notice: Server fetch failed, using local offline cache:', err);
  }

  // Fallback to local cache if offline
  return getLocalBackup().filter((v) => !isDemoVendor(v));
};

export const getVendorStage = (v: Vendor): OnboardingStage => {
  if (v.stage) return v.stage;
  if (v.status === 'approved') return 'completed';
  if (v.status === 'in_progress') return 'kit_preparation';
  return 'doc_verification';
};

/**
 * Registers a new vendor by saving to the central shared server database.
 */
export const addVendor = async (
  vendorData: Omit<Vendor, 'id' | 'regNumber' | 'status' | 'createdAt'>
): Promise<Vendor> => {
  try {
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData),
    });

    if (res.ok) {
      const createdVendor: Vendor = await res.json();
      const current = getLocalBackup();
      setLocalBackup([createdVendor, ...current.filter((v) => v.id !== createdVendor.id)]);

      try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(createdVendor);
      } catch {}

      return createdVendor;
    }
  } catch (err) {
    console.warn('Notice: Server registration endpoint error, falling back to local creation:', err);
  }

  // Fallback offline creation if network is severed
  const id = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const serial = Math.floor(1000 + Math.random() * 9000);
  const regNumber = `MH-SETU-${new Date().getFullYear()}-${serial}`;
  const officer = (vendorData.phone || id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2 === 0 ? 'Ismail' : 'Faraz';
  const now = new Date().toISOString();

  const newVendor: Vendor = {
    ...vendorData,
    id,
    regNumber,
    status: 'in_progress',
    stage: 'doc_verification',
    stageHistory: [
      {
        stage: 'submitted',
        timestamp: now,
        note: 'नोंदणी अर्ज पोर्टलवर प्राप्त झाला व नोंदणी क्रमांक जारी केला गेला.',
      },
      {
        stage: 'doc_verification',
        timestamp: now,
        note: `कागदपत्र पडताळणी प्रक्रियेत - नियुक्त डिजिटल मित्र: ${officer} (${officer === 'Faraz' ? '+91 7208655227' : '+91 9137786506'})`,
      },
    ],
    assignedTo: officer,
    assignedPhone: officer === 'Faraz' ? '7208655227' : '9137786506',
    createdAt: now,
    verifiedAt: undefined,
  };

  const currentBackup = getLocalBackup();
  setLocalBackup([newVendor, ...currentBackup.filter((v) => v.id !== newVendor.id)]);
  return newVendor;
};

/**
 * Updates vendor milestone stage on the central server database.
 */
export const updateVendorStage = async (
  id: string,
  stage: OnboardingStage,
  customNote?: string
): Promise<Vendor | null> => {
  try {
    const res = await fetch(`/api/vendors/${encodeURIComponent(id)}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, note: customNote }),
    });

    if (res.ok) {
      const updated: Vendor = await res.json();
      const current = getLocalBackup();
      setLocalBackup(current.map((v) => (v.id === id ? updated : v)));

      try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(updated);
      } catch {}

      return updated;
    }
  } catch (err) {
    console.warn('Notice: Server stage update error, applying locally:', err);
  }

  // Local fallback
  const now = new Date().toISOString();
  const currentBackup = getLocalBackup();
  let updatedVendor: Vendor | null = null;

  const stageDefaultNotes: Record<OnboardingStage, string> = {
    submitted: 'नोंदणी अर्ज पोर्टलवर यशस्वीरीत्या प्राप्त झाला.',
    doc_verification: 'कागदपत्र व व्यवसायाची पडताळणी प्रक्रियेत आहे.',
    kit_preparation: 'Google Maps पिन, UPI साऊंडबॉक्स व ५-स्टार रिव्ह्यू स्टँडी तयार होत आहे.',
    completed: 'डिजिटल किट वितरण व Google Business ऑनबोर्डिंग पूर्ण झाले.',
  };

  const statusMap: Record<OnboardingStage, Vendor['status']> = {
    submitted: 'pending',
    doc_verification: 'in_progress',
    kit_preparation: 'in_progress',
    completed: 'approved',
  };

  const updatedBackup = currentBackup.map((v) => {
    if (v.id === id) {
      const history = v.stageHistory ? [...v.stageHistory] : [
        { stage: 'submitted' as OnboardingStage, timestamp: v.createdAt, note: 'नोंदणी अर्ज प्राप्त.' },
      ];

      if (!history.some((h) => h.stage === stage)) {
        history.push({
          stage,
          timestamp: now,
          note: customNote || stageDefaultNotes[stage],
        });
      }

      updatedVendor = {
        ...v,
        stage,
        status: statusMap[stage],
        stageHistory: history,
        verifiedAt: stage === 'completed' ? (v.verifiedAt || now) : v.verifiedAt,
      };
      return updatedVendor;
    }
    return v;
  });

  setLocalBackup(updatedBackup);
  return updatedVendor;
};

/**
 * Updates multiple vendors simultaneously on the central server database.
 */
export const bulkUpdateVendorStages = async (
  ids: string[],
  stage: OnboardingStage,
  customNote?: string
): Promise<boolean> => {
  if (!ids || ids.length === 0) return false;

  try {
    const res = await fetch('/api/vendors/bulk/stage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, stage, note: customNote }),
    });

    if (res.ok) {
      // Re-fetch all vendors to refresh cache
      await getAllVendors();
      return true;
    }
  } catch (err) {
    console.warn('Notice: Server bulk update error, applying fallback:', err);
  }

  // Fallback sequential update
  for (const id of ids) {
    await updateVendorStage(id, stage, customNote);
  }
  return true;
};

/**
 * Searches for a vendor by phone number or registration number on the central server database.
 */
export const searchVendorByQuery = async (query: string): Promise<Vendor | null> => {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  try {
    const res = await fetch(`/api/vendors/${encodeURIComponent(clean)}`);
    if (res.ok) {
      const found: Vendor = await res.json();
      return found;
    }
  } catch {}

  // Fallback to searching all vendors
  const vendors = await getAllVendors();
  return (
    vendors.find(
      (v) =>
        v.phone.trim().includes(clean) ||
        v.regNumber.toLowerCase().trim() === clean ||
        v.regNumber.toLowerCase().includes(clean)
    ) || null
  );
};

export const updateVendorStatus = async (
  id: string,
  status: Vendor['status']
): Promise<void> => {
  const currentBackup = getLocalBackup();
  const updatedBackup = currentBackup.map((v) => {
    if (v.id === id) {
      return {
        ...v,
        status,
        verifiedAt: status === 'approved' && !v.verifiedAt ? new Date().toISOString() : v.verifiedAt,
      };
    }
    return v;
  });
  setLocalBackup(updatedBackup);
};

export const deleteVendor = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/vendors/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {}

  const currentBackup = getLocalBackup();
  setLocalBackup(currentBackup.filter((v) => v.id !== id));
};

export const purgeLegacyDemoVendors = async (): Promise<void> => {
  try {
    const rawBackup = getLocalBackup();
    const cleanedBackup = rawBackup.filter((v) => !isDemoVendor(v));
    if (cleanedBackup.length !== rawBackup.length) {
      setLocalBackup(cleanedBackup);
    }
  } catch {}
};
