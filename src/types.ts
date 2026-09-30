export type Language = 'mr' | 'hi' | 'en';

export type PackageId = 'starter' | 'growth' | 'super';

export type BusinessCategory = 'kirana' | 'food' | 'vegetable' | 'retail' | 'artisan';

export type VerificationStatus = 'pending' | 'in_progress' | 'approved';

export type OnboardingStage = 'submitted' | 'doc_verification' | 'kit_preparation' | 'completed';

export interface StageHistoryItem {
  stage: OnboardingStage;
  timestamp: string;
  note?: string;
}

export interface Vendor {
  id: string;
  regNumber: string;
  shopName: string;
  ownerName: string;
  phone: string;
  category: BusinessCategory;
  district: string;
  area: string;
  pincode: string;
  packageId: PackageId;
  packageName: string;
  packagePrice: number;
  status: VerificationStatus;
  stage?: OnboardingStage;
  stageHistory?: StageHistoryItem[];
  assignedTo?: 'Ismail' | 'Faraz' | string;
  assignedPhone?: string;
  notificationSent?: boolean;
  createdAt: string;
  verifiedAt?: string;
}

export interface GrowthPackage {
  id: PackageId;
  name: Record<Language, string>;
  subtitle: Record<Language, string>;
  price: number;
  originalPrice: number;
  companyDiscount: number;
  subsidyDiscount?: number;
  badge?: Record<Language, string>;
  features: Record<Language, string[]>;
  audioText: Record<Language, string>;
  image?: string;
  imageCaption?: Record<Language, string>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
