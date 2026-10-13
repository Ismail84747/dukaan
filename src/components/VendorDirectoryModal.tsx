import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Trash2,
  FileText,
  AlertCircle,
  MessageSquare,
  Clock,
  Download,
  Phone,
  QrCode,
  LogOut,
  ShieldCheck,
  Layers,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vendor, Language, OnboardingStage } from '../types';
import { translations, districtsList } from '../translations';
import { updateVendorStage, getVendorStage, deleteVendor, bulkUpdateVendorStages } from '../db/indexedDB';
import { ASSIGNED_PHONE_FORMATTED, getAssignedOfficer, getOfficerPhoneFormatted, getWhatsAppNotificationUrl, formatOfficerName } from '../utils/assignment';

interface VendorDirectoryModalProps {
  vendors: Vendor[];
  lang: Language;
  onClose: () => void;
  onRefresh: () => void;
  onViewCertificate: (vendor: Vendor, tab: 'receipt' | 'shoplink' | 'standee' | 'status') => void;
  onTrackStatus?: (vendor: Vendor) => void;
  onLogout?: () => void;
  adminUser?: string;
}

export const VendorDirectoryModal: React.FC<VendorDirectoryModalProps> = ({
  vendors,
  lang,
  onClose,
  onRefresh,
  onViewCertificate,
  onTrackStatus,
  onLogout,
  adminUser,
}) => {
  const t = translations[lang];

  const dirLabels = {
    mr: {
      colOfficer: 'नियुक्त अधिकारी',
      alertBtn: 'सूचना',
      receiptBtn: 'पावती',
      standeeBtn: 'स्टँडी',
      alertTitle: (officer: string) => `${officer} (${ASSIGNED_PHONE_FORMATTED}) यांना व्हॉट्सॲप सूचना पाठवा`,
      receiptTitle: 'पावती व वाटप पाहा',
      standeeTitle: '५-स्टार स्टँडी पाहा',
      waVendorTitle: 'व्यापाऱ्याला WhatsApp मेसेज पाठवा',
      waVendorText: (ownerName: string, officerName: string) =>
        `नमस्कार ${ownerName} जी, महाव्यापार डिजिटल सेतू कडून आपले डिजिटल ऑनबोर्डिंगचे काम सुरू झाले आहे. आपले नियुक्त डिजिटल मित्र: ${officerName} (मोबाईल: ${ASSIGNED_PHONE_FORMATTED}).`,
    },
    hi: {
      colOfficer: 'नियुक्त अधिकारी',
      alertBtn: 'सूचना',
      receiptBtn: 'रसीद',
      standeeBtn: 'स्टेंडी',
      alertTitle: (officer: string) => `${officer} (${ASSIGNED_PHONE_FORMATTED}) को व्हाट्सएप सूचना भेजें`,
      receiptTitle: 'रसीद व आवंटन देखें',
      standeeTitle: '५-स्टार स्टेंडी देखें',
      waVendorTitle: 'व्यापारी को WhatsApp संदेश भेजें',
      waVendorText: (ownerName: string, officerName: string) =>
        `नमस्ते ${ownerName} जी, महाव्यापार डिजिटल सेतु की ओर से आपका डिजिटल ऑनबोर्डिंग कार्य प्रारंभ हो चुका है। आपके नियुक्त डिजिटल मित्र: ${officerName} (मोबाइल: ${ASSIGNED_PHONE_FORMATTED}) हैं।`,
    },
    en: {
      colOfficer: 'Assigned Officer',
      alertBtn: 'Alert',
      receiptBtn: 'Receipt',
      standeeBtn: 'Standee',
      alertTitle: (officer: string) => `Send WhatsApp notification to ${officer} (${ASSIGNED_PHONE_FORMATTED})`,
      receiptTitle: 'View Receipt & Officer Assignment',
      standeeTitle: 'View 5-Star Standee',
      waVendorTitle: 'Send WhatsApp message to merchant',
      waVendorText: (ownerName: string, officerName: string) =>
        `Hello ${ownerName}, your MahaVyapaar Digital Setu onboarding is in progress. Your designated field specialist is: ${officerName} (Mobile: ${ASSIGNED_PHONE_FORMATTED}).`,
    },
  }[lang];

  const bulkLabels = {
    mr: {
      selectedCount: (n: number) => `${n} दुकानदार निवडले`,
      selectAll: 'सर्व निवडा',
      clearSelection: 'निवड रद्द करा',
      applyBulkStage: 'एकत्रित टप्पा बदला',
      markAllCompleted: 'सर्व पूर्ण करा (Bulk Complete ✓)',
      applying: 'अपडेट होत आहे...',
      bulkPanelTitle: 'एकत्रित टप्पा व्यवस्थापन',
      stageLabel: 'लक्ष्य टप्पा निवडा:',
    },
    hi: {
      selectedCount: (n: number) => `${n} व्यापारी चुने गए`,
      selectAll: 'सभी चुनें',
      clearSelection: 'चयन रद्द करें',
      applyBulkStage: 'एकत्रित चरण बदलें',
      markAllCompleted: 'सभी पूर्ण करें (Bulk Complete ✓)',
      applying: 'अपडेट हो रहा है...',
      bulkPanelTitle: 'एकत्रित चरण प्रबंधन',
      stageLabel: 'लक्ष्य चरण चुनें:',
    },
    en: {
      selectedCount: (n: number) => `${n} merchants selected`,
      selectAll: 'Select All',
      clearSelection: 'Clear Selection',
      applyBulkStage: 'Update Stage for All',
      markAllCompleted: 'Bulk Complete ✓',
      applying: 'Updating...',
      bulkPanelTitle: 'Bulk Stage Management',
      stageLabel: 'Target Stage:',
    },
  }[lang];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Bulk Selection State
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [bulkTargetStage, setBulkTargetStage] = useState<OnboardingStage>('doc_verification');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  const getCategoryPhoto = (category: string) => {
    switch (category) {
      case 'kirana':
        return 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=150&q=80';
      case 'vegetable':
        return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80';
      case 'food':
        return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80';
      case 'artisan':
        return 'https://images.unsplash.com/photo-1528458988771-332306f15e79?auto=format&fit=crop&w=150&q=80';
      case 'retail':
      default:
        return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80';
    }
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const filteredVendors = vendors.filter((v) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      v.shopName.toLowerCase().includes(term) ||
      v.ownerName.toLowerCase().includes(term) ||
      v.phone.includes(term) ||
      v.regNumber.toLowerCase().includes(term) ||
      v.area.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === 'all' || v.category === selectedCategory;

    const matchesDistrict =
      selectedDistrict === 'all' || v.district === selectedDistrict;

    const matchesStatus =
      selectedStatus === 'all' || v.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesDistrict && matchesStatus;
  });

  const isAllSelected = filteredVendors.length > 0 && filteredVendors.every((v) => selectedVendorIds.includes(v.id));
  const isSomeSelected = filteredVendors.some((v) => selectedVendorIds.includes(v.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVendorIds([]);
    } else {
      setSelectedVendorIds(filteredVendors.map((v) => v.id));
    }
  };

  const handleToggleSelectVendor = (id: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const handleApplyBulkStage = async (stageOverride?: OnboardingStage) => {
    if (selectedVendorIds.length === 0 || isBulkUpdating) return;
    const stageToApply = stageOverride || bulkTargetStage;
    setIsBulkUpdating(true);
    setBulkNotice(null);

    try {
      await bulkUpdateVendorStages(selectedVendorIds, stageToApply);

      if (stageToApply === 'completed') {
        try {
          confetti({
            particleCount: 110,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#ea580c', '#f59e0b', '#7c2d12', '#10b981'],
          });
        } catch {}
      }

      setBulkNotice(
        lang === 'mr'
          ? `✓ निवडलेल्या ${selectedVendorIds.length} दुकानांचा टप्पा यशस्वीरीत्या बदलला!`
          : lang === 'hi'
          ? `✓ चुने गए ${selectedVendorIds.length} दुकानों का चरण सफलतापूर्वक अपडेट किया गया!`
          : `✓ Successfully updated stage for ${selectedVendorIds.length} vendors!`
      );

      setSelectedVendorIds([]);
      onRefresh();

      setTimeout(() => {
        setBulkNotice(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to bulk update stage:', err);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleStageChange = async (
    vendorId: string,
    newStage: OnboardingStage
  ) => {
    try {
      await updateVendorStage(vendorId, newStage);
      onRefresh();
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleDelete = async (vendorId: string) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await deleteVendor(vendorId);
        setSelectedVendorIds((prev) => prev.filter((id) => id !== vendorId));
        onRefresh();
      } catch (err) {
        console.error('Failed to delete vendor:', err);
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredVendors.length === 0) return;

    const headers = [
      'Registration ID',
      'Shop Name',
      'Owner Name',
      'Phone',
      'Category',
      'District',
      'Area',
      'Pincode',
      'Package',
      'Price (INR)',
      'Status',
      'Created Date',
    ];

    const rows = filteredVendors.map((v) => [
      v.regNumber,
      `"${v.shopName.replace(/"/g, '""')}"`,
      `"${v.ownerName.replace(/"/g, '""')}"`,
      v.phone,
      v.category,
      `"${v.district}"`,
      `"${v.area.replace(/"/g, '""')}"`,
      v.pincode,
      `"${v.packageName.replace(/"/g, '""')}"`,
      v.packagePrice,
      v.status,
      v.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MahaVyapaar_Vendors_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-6xl bg-[#FAF5EC] rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-800/40 text-[#2B0E14] my-4 flex flex-col max-h-[90vh]">
        {/* Top Header in Royal Maratha Maroon */}
        <div className="bg-[#4A0E17] text-amber-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-600">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black font-heading text-amber-100">
                {t.adminTitle}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-amber-950 font-black text-xs">
                {vendors.length} {t.totalRegistered}
              </span>
            </div>
            <p className="text-xs text-amber-300/90 font-semibold mt-0.5">
              {t.adminSub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Session Badge */}
            {adminUser && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3B1C10] text-amber-200 border border-amber-500/40 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin: <strong className="text-amber-100">{adminUser}</strong></span>
              </span>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-bold text-xs flex items-center gap-1 border border-rose-700/60 transition cursor-pointer"
                title={lang === 'mr' ? 'प्रशासक सत्रातून बाहेर पडा' : lang === 'hi' ? 'एडमिन सत्र से लॉगआउट करें' : 'Logout Admin Session'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'mr' ? 'बाहेर पडा' : lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            )}

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#4A0E17] font-black text-xs flex items-center gap-1.5 transition-colors border border-amber-300 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.btnExportCsv}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#2B0E14] text-amber-200 hover:text-white hover:bg-rose-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-[#FFFDF7] border-b border-amber-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-xs text-[#2B0E14] focus:outline-none focus:ring-2 focus:ring-[#EA580C] font-semibold"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-xs text-[#2B0E14] focus:outline-none focus:ring-2 focus:ring-[#EA580C] font-bold"
          >
            <option value="all">{t.allCategories}</option>
            <option value="kirana">{t.catKirana}</option>
            <option value="food">{t.catFood}</option>
            <option value="vegetable">{t.catVegetable}</option>
            <option value="retail">{t.catRetail}</option>
            <option value="artisan">{t.catArtisan}</option>
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-xs text-[#2B0E14] focus:outline-none focus:ring-2 focus:ring-[#EA580C] font-bold"
          >
            <option value="all">{t.allDistricts}</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF5EC] border border-amber-700/30 text-xs text-[#2B0E14] focus:outline-none focus:ring-2 focus:ring-[#EA580C] font-bold"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="approved">{t.statusApproved}</option>
            <option value="in_progress">{t.statusInProgress}</option>
            <option value="pending">{t.statusPending}</option>
          </select>
        </div>

        {/* Vendors Table / List */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF5EC]">
          {/* Bulk Notification Banner */}
          {bulkNotice && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bulkNotice}</span>
            </div>
          )}

          {/* Bulk Action Sticky Bar when items are selected */}
          {selectedVendorIds.length > 0 && (
            <div className="bg-gradient-to-r from-[#4A0E17] via-[#3B1C10] to-[#2B0E14] text-amber-100 p-3.5 sm:p-4 rounded-xl border-2 border-amber-400 shadow-xl flex flex-wrap items-center justify-between gap-3 mb-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-black shadow-sm shrink-0">
                  <Layers className="w-5 h-5 text-amber-950" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-amber-200 flex items-center gap-2">
                    <span>{bulkLabels.selectedCount(selectedVendorIds.length)}</span>
                    <span className="text-[10px] text-amber-300/80 font-normal">
                      ({filteredVendors.length} पैकी)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-amber-300/90 mt-0.5">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="hover:underline font-bold text-amber-300 cursor-pointer"
                    >
                      {isAllSelected ? bulkLabels.clearSelection : `${bulkLabels.selectAll} (${filteredVendors.length})`}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedVendorIds([])}
                      className="hover:underline text-rose-300 cursor-pointer"
                    >
                      {bulkLabels.clearSelection}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#2B0E14] p-1 rounded-xl border border-amber-500/50">
                  <span className="text-[11px] font-bold text-amber-200 pl-1.5 hidden sm:inline">
                    {bulkLabels.stageLabel}
                  </span>
                  <select
                    value={bulkTargetStage}
                    onChange={(e) => setBulkTargetStage(e.target.value as OnboardingStage)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-[#4A0E17] text-amber-100 font-black border border-amber-400/40 focus:outline-hidden cursor-pointer"
                  >
                    <option value="submitted">१. अर्ज प्राप्त (Applied)</option>
                    <option value="doc_verification">२. कागदपत्र पडताळणी (Doc Verify)</option>
                    <option value="kit_preparation">३. डिजिटल किट तयारी (Kit Prep)</option>
                    <option value="completed">४. ऑनबोर्डिंग पूर्ण ✓ (Completed)</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isBulkUpdating}
                  onClick={() => handleApplyBulkStage()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#EA580C] hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-sm border border-amber-300 transition cursor-pointer disabled:opacity-50"
                >
                  {isBulkUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Layers className="w-3.5 h-3.5" />
                  )}
                  <span>{isBulkUpdating ? bulkLabels.applying : bulkLabels.applyBulkStage}</span>
                </button>

                <button
                  type="button"
                  disabled={isBulkUpdating}
                  onClick={() => handleApplyBulkStage('completed')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md border border-emerald-300 transition cursor-pointer disabled:opacity-50"
                  title="Mark all selected vendors as Completed"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  <span>{bulkLabels.markAllCompleted}</span>
                </button>
              </div>
            </div>
          )}

          {filteredVendors.length === 0 ? (
            <div className="text-center py-12 text-[#7C2D12]">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-600 mb-2" />
              <p className="font-bold text-sm">{t.noRecords}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-amber-700/30 bg-[#FFFDF7] shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#4A0E17] text-amber-200 font-black border-b border-amber-800">
                  <tr>
                    {/* Bulk Selection Checkbox Header */}
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-[#EA580C] accent-[#EA580C] focus:ring-[#EA580C] cursor-pointer"
                        title={isAllSelected ? bulkLabels.clearSelection : bulkLabels.selectAll}
                      />
                    </th>
                    <th className="p-3">{t.colRegId}</th>
                    <th className="p-3">{t.colShop}</th>
                    <th className="p-3">{dirLabels.colOfficer}</th>
                    <th className="p-3">{t.colContact}</th>
                    <th className="p-3">{t.colPackage}</th>
                    <th className="p-3">{t.colStatus}</th>
                    <th className="p-3 text-right">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200">
                  {filteredVendors.map((vendor) => {
                    const officer = vendor.assignedTo || getAssignedOfficer(vendor);
                    const officerPhone = vendor.assignedPhone
                      ? (vendor.assignedPhone.startsWith('+') ? vendor.assignedPhone : `+91 ${vendor.assignedPhone}`)
                      : getOfficerPhoneFormatted(officer);
                    const whatsappOfficerUrl = getWhatsAppNotificationUrl(vendor, officer, lang);
                    const isSelected = selectedVendorIds.includes(vendor.id);

                    return (
                      <tr
                        key={vendor.id}
                        className={`transition-colors text-[#2B0E14] ${
                          isSelected
                            ? 'bg-amber-100/90 font-medium border-l-4 border-l-[#EA580C]'
                            : 'hover:bg-amber-100/50'
                        }`}
                      >
                        {/* Checkbox Cell */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectVendor(vendor.id)}
                            className="w-4 h-4 rounded text-[#EA580C] accent-[#EA580C] focus:ring-[#EA580C] cursor-pointer"
                          />
                        </td>

                        {/* Reg ID */}
                        <td className="p-3 font-mono font-black text-[#EA580C]">
                          {vendor.regNumber}
                          <div className="text-[10px] text-[#7C2D12] font-sans font-normal">
                            {new Date(vendor.createdAt || Date.now()).toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN')}
                          </div>
                        </td>

                        {/* Shop & Owner */}
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getCategoryPhoto(vendor.category)}
                              alt={vendor.shopName}
                              className="w-10 h-10 rounded-lg object-cover border border-amber-300 shrink-0 shadow-2xs"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-extrabold text-[#4A0E17]">
                                {vendor.shopName}
                              </div>
                              <div className="text-[11px] text-[#5C2B14] font-semibold">
                                {vendor.ownerName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Officer (Ismail / Faraz) */}
                        <td className="p-3">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 font-extrabold text-[#4A0E17] text-[11px]">
                            <span>{formatOfficerName(officer, lang)}</span>
                          </div>
                          <div className="text-[10px] text-[#7C2D12] font-mono font-bold mt-0.5">
                            {officerPhone}
                          </div>
                        </td>

                        {/* Contact & District */}
                        <td className="p-3">
                          <div className="flex items-center gap-1 font-bold text-[#047857]">
                            <Phone className="w-3 h-3 text-[#047857]" />
                            <span>+91 {vendor.phone}</span>
                          </div>
                          <div className="text-[11px] text-[#7C2D12]">
                            {vendor.area}, {vendor.district}
                          </div>
                        </td>

                        {/* Package Fee */}
                        <td className="p-3">
                          <span className="font-black text-[#4A0E17]">
                            ₹{vendor.packagePrice}
                          </span>
                          <div className="text-[10px] text-[#7C2D12] font-semibold">
                            {vendor.packageName}
                          </div>
                        </td>

                        {/* Status / Onboarding Stage Dropdown */}
                        <td className="p-3">
                          {(() => {
                            const curStage = getVendorStage(vendor);
                            return (
                              <select
                                value={curStage}
                                onChange={(e) =>
                                  handleStageChange(
                                    vendor.id,
                                    e.target.value as OnboardingStage
                                  )
                                }
                                className={`px-2 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                                  curStage === 'completed'
                                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                    : curStage === 'kit_preparation'
                                    ? 'bg-amber-100 text-amber-950 border-amber-400'
                                    : curStage === 'doc_verification'
                                    ? 'bg-blue-100 text-blue-950 border-blue-300'
                                    : 'bg-rose-100 text-rose-950 border-rose-300'
                                }`}
                              >
                                <option value="submitted">
                                  {lang === 'mr' ? '१. अर्ज प्राप्त' : lang === 'hi' ? '१. आवेदन प्राप्त' : '1. Applied'}
                                </option>
                                <option value="doc_verification">
                                  {lang === 'mr' ? '२. कागदपत्र पडताळणी' : lang === 'hi' ? '२. दस्तावेज़ सत्यापन' : '2. Doc Verify'}
                                </option>
                                <option value="kit_preparation">
                                  {lang === 'mr' ? '३. डिजिटल किट तयारी' : lang === 'hi' ? '३. डिजिटल किट निर्माण' : '3. Kit Prep'}
                                </option>
                                <option value="completed">
                                  {lang === 'mr' ? '४. ऑनबोर्डिंग पूर्ण ✓' : lang === 'hi' ? '४. ऑनबोर्डिंग पूर्ण ✓' : '4. Completed ✓'}
                                </option>
                              </select>
                            );
                          })()}
                        </td>

                        {/* Action buttons */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Live Status Tracker Trigger */}
                            {onTrackStatus && (
                              <button
                                onClick={() => onTrackStatus(vendor)}
                                className="px-2 py-1 rounded bg-[#EA580C] hover:bg-[#D97706] text-amber-950 text-[11px] font-black flex items-center gap-1 transition-colors shadow-xs border border-amber-400 cursor-pointer"
                                title={lang === 'mr' ? 'थेट ऑनबोर्डिंग प्रगती ट्रॅक करा' : 'Track live onboarding progress'}
                              >
                                <Clock className="w-3 h-3 text-amber-950" />
                                <span className="hidden sm:inline">{lang === 'mr' ? 'ट्रॅक' : 'Track'}</span>
                              </button>
                            )}

                            {/* Notify Assigned Officer (Ismail/Faraz on 9137786506) */}
                            <a
                              href={whatsappOfficerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-[#4A0E17] text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs border border-amber-400"
                              title={dirLabels.alertTitle(formatOfficerName(officer, lang))}
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-800" />
                              <span className="hidden sm:inline">{dirLabels.alertBtn}</span>
                            </a>

                            {/* View Receipt and Officer Assignment */}
                            <button
                              onClick={() => onViewCertificate(vendor, 'receipt')}
                              className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-[#4A0E17] text-[11px] font-bold flex items-center gap-1 transition-colors border border-amber-300 cursor-pointer"
                              title={dirLabels.receiptTitle}
                            >
                              <FileText className="w-3 h-3 text-[#EA580C]" />
                              <span className="hidden sm:inline">{dirLabels.receiptBtn}</span>
                            </button>

                            {/* View 5-Star Standee */}
                            <button
                              onClick={() => onViewCertificate(vendor, 'standee')}
                              className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-[#4A0E17] text-[11px] font-bold flex items-center gap-1 transition-colors border border-amber-300 cursor-pointer"
                              title={dirLabels.standeeTitle}
                            >
                              <QrCode className="w-3 h-3 text-[#EA580C]" />
                              <span className="hidden sm:inline">{dirLabels.standeeBtn}</span>
                            </button>

                            {/* Delete Vendor */}
                            <button
                              onClick={() => handleDelete(vendor.id)}
                              className="p-1 rounded text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                              title={t.btnDelete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
