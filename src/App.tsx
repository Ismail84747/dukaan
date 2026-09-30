import React, { useState, useEffect } from 'react';
import { Language, PackageId, Vendor } from './types';
import { getAllVendors } from './db/indexedDB';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StepByStepGuide } from './components/StepByStepGuide';
import { PackageCards } from './components/PackageCards';
import { DigitalKitShowcase } from './components/DigitalKitShowcase';
import { KitVideoTutorials } from './components/KitVideoTutorials';
import { VendorForm } from './components/VendorForm';
import { CertificateModal } from './components/CertificateModal';
import { VendorDirectoryModal } from './components/VendorDirectoryModal';
import { StatusTrackerModal } from './components/StatusTrackerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AiMitraChat } from './components/AiMitraChat';
import { Footer } from './components/Footer';
import { stopSpeaking, isSpeaking } from './utils/speech';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('mr');
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId>('growth');
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Modals state
  const [activeVendorForCert, setActiveVendorForCert] = useState<Vendor | null>(null);
  const [certInitialTab, setCertInitialTab] = useState<'receipt' | 'shoplink' | 'standee' | 'status'>('receipt');
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('mahavypaar_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [adminUser, setAdminUser] = useState<string>(() => {
    try {
      return sessionStorage.getItem('mahavypaar_admin_user') || 'is';
    } catch {
      return 'is';
    }
  });
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerVendor, setTrackerVendor] = useState<Vendor | null>(null);
  const [trackerQuery, setTrackerQuery] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Monitor audio speech synthesis status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAudioPlaying(isSpeaking());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Initialize DB and fetch vendors
  const fetchVendors = async () => {
    try {
      const list = await getAllVendors();
      setVendors(list);
    } catch (err) {
      console.error('Error fetching vendors from IndexedDB:', err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStopAudio = () => {
    stopSpeaking();
    setIsAudioPlaying(false);
  };

  const handleLanguageChange = (newLang: Language) => {
    stopSpeaking();
    setIsAudioPlaying(false);
    setLang(newLang);
  };

  const handleSelectPackage = (pkgId: PackageId) => {
    setSelectedPackageId(pkgId);
  };

  const scrollToRegistration = () => {
    const el = document.getElementById('registration-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToVideoGuides = () => {
    const el = document.getElementById('video-guides');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVendorRegistered = (newVendor: Vendor) => {
    setVendors((prev) => [newVendor, ...prev]);
    setCertInitialTab('receipt');
    setActiveVendorForCert(newVendor);
  };

  const handleViewCertificate = (
    vendor: Vendor,
    tab: 'receipt' | 'shoplink' | 'standee' | 'status'
  ) => {
    setCertInitialTab(tab);
    setActiveVendorForCert(vendor);
  };

  const handleAdminDeskClick = () => {
    if (isAdminAuthenticated) {
      setIsDirectoryOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      const stored = sessionStorage.getItem('mahavypaar_admin_user');
      if (stored) setAdminUser(stored);
    } catch {}
    setIsAdminLoginOpen(false);
    setIsDirectoryOpen(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('mahavypaar_admin_authenticated');
      sessionStorage.removeItem('mahavypaar_admin_user');
    } catch {}
    setIsDirectoryOpen(false);
  };

  const handleOpenStatusTracker = (vendor?: Vendor, query?: string) => {
    setTrackerVendor(vendor || null);
    setTrackerQuery(query || (vendor ? vendor.phone : ''));
    setIsTrackerOpen(true);
  };

  return (
    <div
      style={{ fontSize: `${fontSizeScale * 100}%` }}
      className="min-h-screen flex flex-col bg-[#FAF5EC] text-[#2A1608]"
    >
      {/* Header Bar */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenDirectory={handleAdminDeskClick}
        onOpenStatusTracker={() => handleOpenStatusTracker()}
        onOpenVideoGuides={scrollToVideoGuides}
        vendorCount={vendors.length}
        isAudioPlaying={isAudioPlaying}
        onStopAudio={handleStopAudio}
        fontSizeScale={fontSizeScale}
        onFontSizeChange={setFontSizeScale}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Banner with Stats and Voice Guide */}
        <Hero
          lang={lang}
          onApplyClick={scrollToRegistration}
          onTrackStatusClick={() => handleOpenStatusTracker()}
          onVideoGuidesClick={scrollToVideoGuides}
          vendorCount={vendors.length}
        />

        {/* 4-Step Process Guide */}
        <StepByStepGuide lang={lang} />

        {/* 3 Tier Growth Packages */}
        <PackageCards
          lang={lang}
          selectedPackageId={selectedPackageId}
          onSelectPackage={handleSelectPackage}
          onContinueToForm={scrollToRegistration}
        />

        {/* 12+ Visual Showcase of Business Types & Deliverables */}
        <DigitalKitShowcase lang={lang} />

        {/* Interactive Visual Video Tutorials for Digital Kit Items */}
        <KitVideoTutorials
          lang={lang}
          onOpenApply={scrollToRegistration}
        />

        {/* Registration Form with Mic Voice Input */}
        <VendorForm
          lang={lang}
          selectedPackageId={selectedPackageId}
          onSelectPackage={handleSelectPackage}
          onVendorRegistered={handleVendorRegistered}
        />
      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Floating AI Mitra Assistant */}
      <AiMitraChat lang={lang} />

      {/* Certificate & Standee Modal */}
      {activeVendorForCert && (
        <CertificateModal
          vendor={activeVendorForCert}
          lang={lang}
          initialTab={certInitialTab}
          onClose={() => setActiveVendorForCert(null)}
        />
      )}

      {/* Admin Vendor Directory Desk Modal */}
      {isDirectoryOpen && (
        <VendorDirectoryModal
          vendors={vendors}
          lang={lang}
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          onClose={() => setIsDirectoryOpen(false)}
          onRefresh={fetchVendors}
          onViewCertificate={(v, tab) => {
            setIsDirectoryOpen(false);
            handleViewCertificate(v, tab);
          }}
          onTrackStatus={(v) => {
            setIsDirectoryOpen(false);
            handleOpenStatusTracker(v);
          }}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        lang={lang}
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Real-time Onboarding Status Tracker Modal */}
      {isTrackerOpen && (
        <StatusTrackerModal
          lang={lang}
          initialVendor={trackerVendor}
          initialQuery={trackerQuery}
          onClose={() => {
            setIsTrackerOpen(false);
            setTrackerVendor(null);
            setTrackerQuery('');
          }}
          onOpenCertificateModal={(v, tab) => {
            setIsTrackerOpen(false);
            handleViewCertificate(v, tab);
          }}
        />
      )}
    </div>
  );
};
