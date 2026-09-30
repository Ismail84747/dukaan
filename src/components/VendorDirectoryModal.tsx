import React, { useState } from 'react';
import { X, Search, Trash2, FileText, Star, AlertCircle, MessageSquare, Bell, Clock, Download, Phone, QrCode, LogOut, ShieldCheck } from 'lucide-react';
import { Vendor, Language, OnboardingStage } from '../types';
import { translations, districtsList } from '../translations';
import { updateVendorStage, getVendorStage, deleteVendor } from '../db/indexedDB';
import { ASSIGNED_PHONE_FORMATTED, getAssignedOfficer, getWhatsAppNotificationUrl, formatOfficerName } from '../utils/assignment';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

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
      `"${v.district.replace(/"/g, '""')}"`,
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
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
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
                    const whatsappOfficerUrl = getWhatsAppNotificationUrl(vendor, officer, lang);

                    return (
                      <tr
                        key={vendor.id}
                        className="hover:bg-amber-100/50 transition-colors text-[#2B0E14]"
                      >
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
                            {ASSIGNED_PHONE_FORMATTED}
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
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                              title={dirLabels.alertTitle(formatOfficerName(officer, lang))}
                            >
                              <Bell className="w-3 h-3 text-amber-300 animate-pulse" />
                              <span className="hidden sm:inline">{dirLabels.alertBtn}</span>
                            </a>

                            {/* View Receipt & Assignment */}
                            <button
                              onClick={() =>
                                onViewCertificate(vendor, 'receipt')
                              }
                              className="px-2 py-1 rounded bg-[#4A0E17] hover:bg-[#6B1D2F] text-amber-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title={dirLabels.receiptTitle}
                            >
                              <FileText className="w-3 h-3 text-amber-400" />
                              <span className="hidden sm:inline">{dirLabels.receiptBtn}</span>
                            </button>

                            {/* View Digital Shop QR */}
                            <button
                              onClick={() => onViewCertificate(vendor, 'shoplink')}
                              className="px-2 py-1 rounded bg-[#EA580C] hover:bg-[#D97706] text-amber-950 text-[11px] font-black flex items-center gap-1 transition-colors border border-amber-300"
                              title={lang === 'mr' ? 'डिजिटल दुकान QR जनरेटर पहा' : 'View Digital Shop QR Generator'}
                            >
                              <QrCode className="w-3 h-3 text-amber-950" />
                              <span className="hidden sm:inline">QR</span>
                            </button>

                            {/* View Standee */}
                            <button
                              onClick={() => onViewCertificate(vendor, 'standee')}
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-amber-950 text-[11px] font-bold flex items-center gap-1 transition-colors border border-amber-300"
                              title={dirLabels.standeeTitle}
                            >
                              <Star className="w-3 h-3 fill-amber-950 text-amber-950" />
                              <span className="hidden sm:inline">{dirLabels.standeeBtn}</span>
                            </button>

                            {/* WhatsApp Connect with Vendor */}
                            <a
                              href={`https://wa.me/91${vendor.phone}?text=${encodeURIComponent(
                                dirLabels.waVendorText(vendor.ownerName, formatOfficerName(officer, lang))
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
                              title={dirLabels.waVendorTitle}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(vendor.id)}
                              className="p-1 rounded bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
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
