import { Vendor, OnboardingStage } from '../types';

const DB_NAME = 'MahaVyapaarDB';
const DB_VERSION = 2; // Incremented to 2 to ensure onupgradeneeded triggers on existing version 1 DBs
const STORE_NAME = 'vendors';
const LOCAL_STORAGE_KEY = 'mahavypaar_vendors_cache';

// Known legacy demo vendor identifiers
const DEMO_PHONES = new Set(['9822104523', '9423558812', '9766432190', '9158334421', '9637890123']);

export const isDemoVendor = (v: any): boolean => {
  if (!v) return true;
  if (v.id && String(v.id).startsWith('demo')) return true;
  if (v.phone && DEMO_PHONES.has(String(v.phone).trim())) return true;
  if (v.isDemo) return true;
  return false;
};

// Helper to get local backup
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

// Helper to set local backup
const setLocalBackup = (vendors: Vendor[]): void => {
  try {
    const clean = vendors.filter((v) => !isDemoVendor(v));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const openRequest = (version?: number) => {
      const request = version ? indexedDB.open(DB_NAME, version) : indexedDB.open(DB_NAME, DB_VERSION);

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

      request.onsuccess = () => {
        const db = request.result;

        // If the database was already created in an earlier session without the vendors store:
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const nextVersion = (db.version || 1) + 1;
          db.close();
          const upgradeReq = indexedDB.open(DB_NAME, nextVersion);
          upgradeReq.onupgradeneeded = (ev) => {
            const upgradedDb = (ev.target as IDBOpenDBRequest).result;
            if (!upgradedDb.objectStoreNames.contains(STORE_NAME)) {
              const store = upgradedDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
              store.createIndex('regNumber', 'regNumber', { unique: true });
              store.createIndex('category', 'category', { unique: false });
              store.createIndex('district', 'district', { unique: false });
              store.createIndex('status', 'status', { unique: false });
              store.createIndex('createdAt', 'createdAt', { unique: false });
            }
          };
          upgradeReq.onsuccess = () => resolve(upgradeReq.result);
          upgradeReq.onerror = () => reject(upgradeReq.error);
          return;
        }

        db.onversionchange = () => {
          db.close();
        };

        resolve(db);
      };
    };

    openRequest();
  });
};

export const getAllVendors = async (): Promise<Vendor[]> => {
  purgeLegacyDemoVendors();
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const rawResults = (request.result as Vendor[]) || [];
          const results = rawResults.filter((v) => !isDemoVendor(v));
          results.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLocalBackup(results);
          resolve(results);
        };

        request.onerror = () => {
          console.warn('IDB store.getAll error, using fallback:', request.error);
          const fallback = getLocalBackup().filter((v) => !isDemoVendor(v));
          resolve(fallback);
        };
      } catch (txErr) {
        console.warn('IDB transaction error, using fallback:', txErr);
        const fallback = getLocalBackup().filter((v) => !isDemoVendor(v));
        resolve(fallback);
      }
    });
  } catch (err) {
    console.warn('IDB init error in getAllVendors, using fallback:', err);
    return getLocalBackup().filter((v) => !isDemoVendor(v));
  }
};

export const getVendorStage = (v: Vendor): OnboardingStage => {
  if (v.stage) return v.stage;
  if (v.status === 'approved') return 'completed';
  if (v.status === 'in_progress') return 'kit_preparation';
  return 'doc_verification';
};

export const addVendor = async (
  vendorData: Omit<Vendor, 'id' | 'regNumber' | 'status' | 'createdAt'>
): Promise<Vendor> => {
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
        note: `कागदपत्र पडताळणी प्रक्रियेत - नियुक्त डिजिटल मित्र: ${officer} (+91 9137786506)`,
      },
    ],
    assignedTo: officer,
    assignedPhone: '9137786506',
    createdAt: now,
    verifiedAt: undefined,
  };

  // Update backup first
  const currentBackup = getLocalBackup();
  setLocalBackup([newVendor, ...currentBackup.filter((v) => v.id !== newVendor.id)]);

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.add(newVendor);

        request.onsuccess = () => resolve(newVendor);
        request.onerror = () => {
          console.warn('IDB store.add error, resolved with local backup:', request.error);
          resolve(newVendor);
        };
      } catch (txErr) {
        console.warn('IDB tx error in addVendor, resolved with local backup:', txErr);
        resolve(newVendor);
      }
    });
  } catch (err) {
    console.warn('IDB init error in addVendor, using local backup:', err);
    return newVendor;
  }
};

export const updateVendorStage = async (
  id: string,
  stage: OnboardingStage,
  customNote?: string
): Promise<Vendor | null> => {
  const currentBackup = getLocalBackup();
  let updatedVendor: Vendor | null = null;
  const now = new Date().toISOString();

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

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const vendor = getReq.result as Vendor;
          if (!vendor) {
            resolve(updatedVendor);
            return;
          }
          const history = vendor.stageHistory ? [...vendor.stageHistory] : [
            { stage: 'submitted' as OnboardingStage, timestamp: vendor.createdAt, note: 'नोंदणी अर्ज प्राप्त.' },
          ];
          if (!history.some((h) => h.stage === stage)) {
            history.push({
              stage,
              timestamp: now,
              note: customNote || stageDefaultNotes[stage],
            });
          }
          vendor.stage = stage;
          vendor.status = statusMap[stage];
          vendor.stageHistory = history;
          if (stage === 'completed' && !vendor.verifiedAt) {
            vendor.verifiedAt = now;
          }
          const updateReq = store.put(vendor);
          updateReq.onsuccess = () => resolve(vendor);
          updateReq.onerror = () => resolve(updatedVendor);
        };
        getReq.onerror = () => resolve(updatedVendor);
      } catch {
        resolve(updatedVendor);
      }
    });
  } catch (err) {
    console.warn('IDB updateVendorStage error:', err);
    return updatedVendor;
  }
};

export const searchVendorByQuery = async (query: string): Promise<Vendor | null> => {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;
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
  // Update local backup
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

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const vendor = getReq.result as Vendor;
          if (!vendor) {
            resolve();
            return;
          }
          vendor.status = status;
          if (status === 'approved' && !vendor.verifiedAt) {
            vendor.verifiedAt = new Date().toISOString();
          }
          const updateReq = store.put(vendor);
          updateReq.onsuccess = () => resolve();
          updateReq.onerror = () => resolve();
        };
        getReq.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch (err) {
    console.warn('IDB updateVendorStatus error:', err);
  }
};

export const deleteVendor = async (id: string): Promise<void> => {
  // Update local backup
  const currentBackup = getLocalBackup();
  setLocalBackup(currentBackup.filter((v) => v.id !== id));

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch (err) {
    console.warn('IDB deleteVendor error:', err);
  }
};

// Purge any legacy demo vendors that might be cached in user's browser
export const purgeLegacyDemoVendors = async (): Promise<void> => {
  try {
    const rawBackup = getLocalBackup();
    const cleanedBackup = rawBackup.filter((v) => !isDemoVendor(v));
    if (cleanedBackup.length !== rawBackup.length) {
      setLocalBackup(cleanedBackup);
    }

    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result as Vendor[]) || [];
      for (const rec of records) {
        if (isDemoVendor(rec)) {
          store.delete(rec.id);
        }
      }
    };
  } catch (e) {
    console.warn('Notice while checking legacy demo records:', e);
  }
};


