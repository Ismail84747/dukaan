import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { IndianFlag } from './IndianFlag';

interface DigitalKitShowcaseProps {
  lang: Language;
}

interface ShowcaseItem {
  id: string;
  category: 'all' | 'retail' | 'food' | 'street' | 'craft';
  title: {
    mr: string;
    hi: string;
    en: string;
  };
  desc: {
    mr: string;
    hi: string;
    en: string;
  };
  deliverables: {
    mr: string[];
    hi: string[];
    en: string[];
  };
  imageUrl: string;
  badge: {
    mr: string;
    hi: string;
    en: string;
  };
}

export const DigitalKitShowcase: React.FC<DigitalKitShowcaseProps> = ({ lang }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'retail' | 'food' | 'street' | 'craft'>('all');

  const items: ShowcaseItem[] = [
    {
      id: 'kirana',
      category: 'retail',
      title: {
        mr: 'किराणा व जनरल स्टोअर्स',
        hi: 'किराना व जनरल स्टोर्स',
        en: 'Kirana & Grocery Stores',
      },
      desc: {
        mr: 'स्थानिक किराणा दुकानांसाठी Google Maps पिन, डिजिटल QR आणि काऊंटर स्टँडी सेटअप.',
        hi: 'स्थानीय किराना दुकानों के लिए Google Maps पिन, डिजिटल QR और काउंटर स्टेंडी सेटअप।',
        en: 'Google Maps pin, contactless QR and acrylic counter standee for neighbourhood grocery shops.',
      },
      deliverables: {
        mr: ['Google Maps पिन', 'UPI QR स्टँडी', '५-स्टार रिव्ह्यू'],
        hi: ['Google Maps पिन', 'UPI QR स्टेंडी', '५-स्टार रिव्यू'],
        en: ['Google Maps Pin', 'UPI QR Standee', '5-Star Review'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'रिटेल सेतू',
        hi: 'रिटेल सेतु',
        en: 'Retail Setu',
      },
    },
    {
      id: 'vegetables',
      category: 'street',
      title: {
        mr: 'भाजीपाला व फळ हातगाडी विक्रेते',
        hi: 'फल व सब्जी ठेला विक्रेता',
        en: 'Fresh Fruits & Vegetables Vendors',
      },
      desc: {
        mr: 'हातगाडी व फेरीवाल्यांसाठी जलद डिजिटल पेमेंट व सेतू अधिकारी थेट मदत.',
        hi: 'रेहड़ी-पटरी व ठेला व्यापारियों के लिए त्वरित डिजिटल भुगतान सहायता।',
        en: 'Weatherproof instant payment QR kits & field officer setup for street carts.',
      },
      deliverables: {
        mr: ['हवामान-रोधक QR', 'साऊंडबॉक्स सहाय्य', 'थेट नोंदणी'],
        hi: ['वाटरप्रूफ QR', 'साउंडबॉक्स सहायता', 'प्रत्यक्ष पंजीकरण'],
        en: ['Weatherproof QR', 'Soundbox Assistance', 'Direct Registration'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'फेरीवाला सेतू',
        hi: 'रेहड़ी सेतु',
        en: 'Street Vendor Setu',
      },
    },
    {
      id: 'tea-stall',
      category: 'food',
      title: {
        mr: 'चहाची टपरी व स्नॅक्स सेंटर',
        hi: 'चाय की टपरी व स्नैक्स सेंटर',
        en: 'Chai Tapri & Snacks Corner',
      },
      desc: {
        mr: 'झटपट सुट्या पैशांची अडचण दूर करणारा UPI साऊंडबॉक्स व गुगल मॅप्स शोध.',
        hi: 'खुले पैसों की समस्या से मुक्ति देने वाला UPI साउंडबॉक्स और गूगल मैप्स खोज।',
        en: 'Instant voice confirmation soundbox application and local map presence.',
      },
      deliverables: {
        mr: ['UPI साऊंडबॉक्स', 'Google Maps लोकेशन', 'कॅटलॉग'],
        hi: ['UPI साउंडबॉक्स', 'Google Maps लोकेशन', 'कैटलॉग'],
        en: ['UPI Soundbox', 'Google Maps Location', 'Catalog'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'स्नॅक्स सेतू',
        hi: 'स्नैक्स सेतु',
        en: 'Snacks Setu',
      },
    },
    {
      id: 'restaurant',
      category: 'food',
      title: {
        mr: 'हॉटेल्स, ढाबा व स्थानिक खानावळ',
        hi: 'होटल्स, ढाबा व स्थानीय भोजनालय',
        en: 'Restaurants, Dhabas & Eateries',
      },
      desc: {
        mr: 'Swiggy / Zomato ऑनबोर्डिंग, ONDC नेटवर्क आणि Google My Business ५-स्टार रेटिंग.',
        hi: 'Swiggy / Zomato ऑनबोर्डिंग, ONDC नेटवर्क और Google My Business ५-स्टार रेटिंग।',
        en: 'Food delivery platform onboarding (Swiggy/Zomato), ONDC, and customer reviews.',
      },
      deliverables: {
        mr: ['Swiggy/Zomato ऑनबोर्डिंग', '५-स्टार रिव्ह्यू स्टँडी', 'ONDC नोंदणी'],
        hi: ['Swiggy/Zomato ऑनबोर्डिंग', '५-स्टार रिव्यू स्टेंडी', 'ONDC रजिस्ट्रेशन'],
        en: ['Swiggy/Zomato Setup', '5-Star Review Standee', 'ONDC Network'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'फूड सेतू',
        hi: 'फूड सेतु',
        en: 'Food Setu',
      },
    },
    {
      id: 'bakery-sweets',
      category: 'food',
      title: {
        mr: 'मिठाई व बेकरी दालन',
        hi: 'मिठाई व बेकरी शॉप्स',
        en: 'Sweet & Bakery Shops',
      },
      desc: {
        mr: 'सणासुदीच्या काळात ऑनलाईन ग्राहक आकर्षित करण्यासाठी काऊंटर रिव्ह्यू व मॅप्स स्थान.',
        hi: 'त्योहारों में ऑनलाइन ग्राहकों को जोड़ने के लिए काउंटर रिव्यू व मैप्स स्थान।',
        en: 'Counter review standees and Google verified presence for sweet & bakery retailers.',
      },
      deliverables: {
        mr: ['Google ५-स्टार स्टँडी', 'बिझनेस प्रोफाईल', 'UPI QR'],
        hi: ['Google ५-स्टार स्टेंडी', 'बिजनेस प्रोफाइल', 'UPI QR'],
        en: ['Google 5-Star Standee', 'Business Profile', 'UPI QR'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'मिठाई सेतू',
        hi: 'मिठाई सेतु',
        en: 'Sweets Setu',
      },
    },
    {
      id: 'garments',
      category: 'retail',
      title: {
        mr: 'कापड, टेलरिंग व बुटीक',
        hi: 'कपड़ा, टेलरिंग व बुटीक स्टोर्स',
        en: 'Garments, Tailoring & Boutiques',
      },
      desc: {
        mr: 'स्थानिक फॅशन स्टोअर्ससाठी WhatsApp बिझनेस कॅटलॉग आणि Google My Business पेज.',
        hi: 'स्थानीय फैशन दुकानों के लिए WhatsApp बिजनेस कैटलॉग और Google पेज।',
        en: 'Digital catalog setup and verified local maps listing for apparel and tailoring.',
      },
      deliverables: {
        mr: ['WhatsApp कॅटलॉग', 'Google शोध पिन', 'QR पेमेंट'],
        hi: ['WhatsApp कैटलॉग', 'Google सर्च पिन', 'QR पेमेंट'],
        en: ['WhatsApp Catalog', 'Google Search Pin', 'QR Payment'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'फॅशन सेतू',
        hi: 'फैशन सेतु',
        en: 'Fashion Setu',
      },
    },
    {
      id: 'flowers',
      category: 'street',
      title: {
        mr: 'फुले, हार व पूजा साहित्य स्टॉल्स',
        hi: 'फूल, माला व पूजा सामग्री स्टॉल',
        en: 'Flowers & Puja Essentials Stalls',
      },
      desc: {
        mr: 'मंदिरे व बाजार परिसरातील विक्रेत्यांसाठी तात्काळ UPI QR पेमेंट स्टँड.',
        hi: 'मंदिर व बाज़ार परिसर के विक्रेताओं के लिए तत्काल UPI QR पेमेंट स्टैंड।',
        en: 'Instant contactless QR payment setup for temple & market flower vendors.',
      },
      deliverables: {
        mr: ['काऊंटर QR स्टँड', 'जलद पावती', 'सेतू सहाय्य'],
        hi: ['काउंटर QR स्टैंड', 'त्वरित रसीद', 'सेतु सहायता'],
        en: ['Counter QR Stand', 'Quick Receipt', 'Setu Support'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'पूजा सेतू',
        hi: 'पूजा सेतु',
        en: 'Puja Setu',
      },
    },
    {
      id: 'spices-wholesale',
      category: 'retail',
      title: {
        mr: 'अन्नधान्य, मसाले व बाजार व्यापारी',
        hi: 'अनाज, मसाले व थोक बाज़ार व्यापारी',
        en: 'Grains, Spices & APMC Merchants',
      },
      desc: {
        mr: 'थोक व किरकोळ अन्नधान्य व्यापार्‍यांसाठी गुगल मॅप्स शोध व अधिकृत डिजिटल सेतू पावती.',
        hi: 'थोक व खुदरा व्यापारियों के लिए गूगल मैप्स खोज और अधिकृत डिजिटल रसीद।',
        en: 'Verified wholesale maps visibility and authorized digital registration.',
      },
      deliverables: {
        mr: ['APMC लोकेशन मॅपिंग', 'अधिकृत पावती', '५-स्टार रिव्ह्यू'],
        hi: ['APMC लोकेशन मैपिंग', 'अधिकृत रसीद', '५-स्टार रिव्यू'],
        en: ['APMC Location Mapping', 'Authorized Receipt', '5-Star Review'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'व्यापार सेतू',
        hi: 'व्यापार सेतु',
        en: 'Trader Setu',
      },
    },
    {
      id: 'artisans',
      category: 'craft',
      title: {
        mr: 'स्थानिक हस्तकला, कुंभारकाम व कारागीर',
        hi: 'स्थानीय हस्तशिल्प, कुम्हार व कारीगर',
        en: 'Local Handicrafts, Pottery & Artisans',
      },
      desc: {
        mr: 'पारंपरिक कारागिरांच्या कलेला ऑनलाईन ग्राहक व पर्यटकांपर्यंत पोहोचवणारा डिजिटल दुवा.',
        hi: 'पारंपरिक कारीगरों की कला को ऑनलाइन पर्यटकों तक पहुंचाने वाला डिजिटल सेतु।',
        en: 'Connecting traditional craftsmen and artisans to tourist buyers and online maps.',
      },
      deliverables: {
        mr: ['Google मॅप्स पिन', 'ONDC ऑनबोर्डिंग', 'डिजिटल पावती'],
        hi: ['Google मैप्स पिन', 'ONDC ऑनबोर्डिंग', 'डिजिटल रसीद'],
        en: ['Google Maps Pin', 'ONDC Onboarding', 'Digital Receipt'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'कला सेतू',
        hi: 'कला सेतु',
        en: 'Artisan Setu',
      },
    },
    {
      id: 'hardware',
      category: 'retail',
      title: {
        mr: 'हार्डवेअर, इलेक्ट्रिकल व प्लंबिंग दुकाने',
        hi: 'हार्डवेयर, इलेक्ट्रिकल व प्लंबिंग स्टोर्स',
        en: 'Hardware, Electrical & Plumbing Stores',
      },
      desc: {
        mr: 'परिसरातील ग्राहकांना त्वरित दुकानाचे लोकेशन, फोन नंबर व चालू वेळेची माहिती देणारा सेतू.',
        hi: 'आस-पास के ग्राहकों को त्वरित दुकान लोकेशन, फोन व समय की जानकारी देने वाला सेतु।',
        en: 'Help nearby homeowners discover store timings, contact numbers, and directions.',
      },
      deliverables: {
        mr: ['Google बिझनेस पिन', 'UPI QR स्टँडी', 'सेतू सहाय्य'],
        hi: ['Google बिजनेस पिन', 'UPI QR स्टेंडी', 'सेतु सहायता'],
        en: ['Google Business Pin', 'UPI QR Standee', 'Setu Support'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'उद्योग सेतू',
        hi: 'उद्योग सेतु',
        en: 'Hardware Setu',
      },
    },
    {
      id: 'salon',
      category: 'craft',
      title: {
        mr: 'सलून, हेअर कटिंग व ब्युटी पार्लर',
        hi: 'सैलून, हेयर कटिंग व ब्यूटी पार्लर',
        en: 'Salons, Hair Cutting & Beauty Parlours',
      },
      desc: {
        mr: 'स्थानिक ५-स्टार रिव्ह्यू फलक आणि Google Maps वरील विश्वासार्ह ग्राहक परीक्षणे.',
        hi: 'स्थानीय ५-स्टार रिव्यू बोर्ड और गूगल मैप्स पर ग्राहकों की प्रामाणिक समीक्षाएं।',
        en: '5-Star Google review acrylic stands and customer ratings for personal grooming.',
      },
      deliverables: {
        mr: ['५-स्टार रिव्ह्यू फलक', 'Google प्रोफाईल', 'QR पेमेंट'],
        hi: ['५-स्टार रिव्यू फलक', 'Google प्रोफाइल', 'QR पेमेंट'],
        en: ['5-Star Review Stand', 'Google Profile', 'QR Payment'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'सेवा सेतू',
        hi: 'सेवा सेतु',
        en: 'Service Setu',
      },
    },
    {
      id: 'electronics-repair',
      category: 'craft',
      title: {
        mr: 'मोबाईल, टीव्ही व इलेक्ट्रॉनिक्स दुरुस्ती',
        hi: 'मोबाइल, टीवी व इलेक्ट्रॉनिक्स रिपेयरिंग',
        en: 'Mobile, TV & Electronics Repair Desks',
      },
      desc: {
        mr: 'दुरुस्ती केंद्रांसाठी अधिकृत सेतू ओळख, Google सर्च दृश्यमानता व व्हॉट्सॲप थेट संपर्क.',
        hi: 'रिपेयरिंग केंद्रों के लिए अधिकृत सेतु पहचान, गूगल खोज और व्हाट्सएप संपर्क।',
        en: 'Verified search visibility, call button on Google Maps, and direct WhatsApp contact.',
      },
      deliverables: {
        mr: ['Google कॉल बटन', 'UPI साऊंडबॉक्स', 'पडताळणी पावती'],
        hi: ['Google कॉल बटन', 'UPI साउंडबॉक्स', 'सत्यापन रसीद'],
        en: ['Google Call Button', 'UPI Soundbox', 'Verified Slip'],
      },
      imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
      badge: {
        mr: 'तंत्रज्ञान सेतू',
        hi: 'तकनीक सेतु',
        en: 'Tech Setu',
      },
    },
  ];

  const filterLabels = {
    all: { mr: 'सर्व व्यवसाय (All)', hi: 'सभी व्यापार (All)', en: 'All Businesses' },
    retail: { mr: 'किराणा व रिटेल', hi: 'किराना व रिटेल', en: 'Grocery & Retail' },
    food: { mr: 'हॉटेल्स व खाद्य', hi: 'होटल्स व खानपान', en: 'Food & Restaurants' },
    street: { mr: 'फेरीवाले व स्टॉल्स', hi: 'रेहड़ी व स्टॉल्स', en: 'Street Carts & Stalls' },
    craft: { mr: 'सेवा व कारागीर', hi: 'सेवा व कारीगर', en: 'Services & Artisans' },
  };

  const filteredItems = activeFilter === 'all' ? items : items.filter((it) => it.category === activeFilter);

  const sectionHeadings = {
    badge: {
      mr: 'अधिकृत डिजिटल सेवा व व्यवसाय प्रकार',
      hi: 'अधिकृत डिजिटल सेवाएं व व्यवसाय प्रकार',
      en: 'Authorized Digital Services & Business Categories',
    },
    title: {
      mr: 'महाराष्ट्रातील सर्व लहान-मोठ्या व्यावसायिकांसाठी डिजिटल सेतू',
      hi: 'महाराष्ट्र के सभी छोटे-बड़े व्यापारियों के लिए डिजिटल सेतु',
      en: 'Digital Setu for Every Local Business Across Maharashtra',
    },
    sub: {
      mr: 'महाव्यापार डिजिटल सोल्युशन्स प्रायव्हेट लिमिटेड कडून फेरीवाल्यांपासून ते मोठ्या दुकानांपर्यंत थेट व्यावसायिक मार्गदर्शन व किट वाटप.',
      hi: 'महाव्यापार डिजिटल सॉल्यूशंस प्राइवेट लिमिटेड द्वारा रेहड़ी-पटरी से लेकर बड़ी दुकानों तक सीधी व्यावसायिक सहायता व किट आवंटन।',
      en: 'Professional digital onboarding, Google Maps blue-tick verification, and physical QR kits by MahaVyapaar Digital Solutions Pvt. Ltd.',
    },
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#F5EFE6] border-b border-amber-800/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading with Indian Flag */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-200/90 text-[#4A0E17] border border-amber-400 text-xs font-black mb-3 shadow-xs">
            <IndianFlag size="xs" />
            <span>{sectionHeadings.badge[lang]}</span>
            <span className="text-[#EA580C]">• Pvt. Ltd.</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4A0E17] tracking-tight font-heading">
            {sectionHeadings.title[lang]}
          </h2>
          <p className="text-[#5C2B14] text-sm sm:text-base mt-2.5 font-semibold">
            {sectionHeadings.sub[lang]}
          </p>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {(['all', 'retail', 'food', 'street', 'craft'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-[#4A0E17] text-amber-200 shadow-sm border border-amber-600 font-black'
                    : 'bg-white/80 text-[#5C2B14] hover:bg-amber-100 border border-amber-300'
                }`}
              >
                {filterLabels[cat][lang]}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Business Visual Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFDF7] rounded-2xl overflow-hidden border-2 border-amber-800/15 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                {/* Photo with gradient overlay & badge */}
                <div className="relative h-44 w-full overflow-hidden bg-amber-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Indian Tricolor & Category Badge */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20">
                      <IndianFlag size="xs" />
                      <span>{item.badge[lang]}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-[#3B1C10] text-[10px] font-black shadow-xs">
                      Pvt. Ltd.
                    </span>
                  </div>

                  {/* Title overlay at bottom of image */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="text-sm sm:text-base font-black text-amber-200 font-heading drop-shadow-xs leading-snug">
                      {item.title[lang]}
                    </h3>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-3.5">
                  <p className="text-xs text-[#5C2B14] leading-relaxed font-medium mb-3">
                    {item.desc[lang]}
                  </p>

                  {/* Deliverables Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.deliverables[lang].map((deliv, dIdx) => (
                      <span
                        key={dIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100/90 text-[#4A0E17] text-[10px] font-bold border border-amber-300/80"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                        <span>{deliv}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer with Price Range */}
              <div className="p-3 border-t border-amber-200/80 bg-amber-50/50 flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-[#4A0E17]">
                  {lang === 'mr' || lang === 'hi' ? 'सवलत शुल्क: ₹२९ - ₹१४९' : 'Corporate Fee: ₹29 - ₹149'}
                </span>
                <span className="text-[#EA580C] font-bold flex items-center gap-1">
                  <span>२४ तासांत मंजुरी</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Assurance Note */}
        <div className="mt-10 p-4 rounded-xl bg-amber-100/80 border border-amber-300 text-center max-w-2xl mx-auto flex items-center justify-center gap-2.5">
          <IndianFlag size="sm" />
          <p className="text-xs font-bold text-[#4A0E17]">
            {lang === 'mr'
              ? 'स्थानिक व्यावसायिक समृद्धीसाठी समर्पित — महाव्यापार डिजिटल सोल्युशन्स प्रायव्हेट लिमिटेड'
              : lang === 'hi'
              ? 'स्थानीय व्यापारियों की समृद्धि के लिए समर्पित — महाव्यापार डिजिटल सॉल्यूशंस प्राइवेट लिमिटेड'
              : 'Dedicated to Local Merchant Empowerment — MahaVyapaar Digital Solutions Pvt. Ltd.'}
          </p>
        </div>
      </div>
    </section>
  );
};
