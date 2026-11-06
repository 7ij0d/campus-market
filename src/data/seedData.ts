import {
  User,
  CampusLocation,
  Category,
  Store,
  StoreCategory,
  Product,
  Order,
  Review,
  AppNotification,
  Banner,
  StoreInvitation,
  PlatformSettings,
  StoreSubscription,
  AuditLog,
} from '../types/database';

export const INITIAL_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-main',
    name_ar: 'داخل الكلية',
    campus_name_ar: 'الحرم الجامعي الرئيسي',
    pickup_points: [
      'الساحة الرئيسية أمام المكتبة',
      'مدخل كلية الهندسة وتقنية المعلومات',
      'مدخل كلية الطب البشري والأسنان',
      'الكافيتريا المركزية',
      'مبنى المدرجات المركزية',
    ],
    is_active: true,
  },
  {
    id: 'loc-med',
    name_ar: 'مجمع الكليات الطبية',
    campus_name_ar: 'الحرم الطبي الجامعي',
    pickup_points: [
      'عيادات طب الأسنان التعليمية',
      'مدخل كلية الصيدلة',
      'استراحة الطلبة - المبنى B',
    ],
    is_active: true,
  },
  {
    id: 'loc-eng',
    name_ar: 'كلية الاقتصاد والقانون',
    campus_name_ar: 'القرية الجامعية ب',
    pickup_points: ['البوابة الشرقية', 'قاعة المطالعة الكبرى'],
    is_active: true,
  },
];

// No fake student or merchant accounts pre-populated; only the platform Super Admin account exists for management
export const INITIAL_USERS: User[] = [
  {
    id: 'user-super-admin',
    email: 'admin@campusmarket.ly',
    phone: '0910000000',
    full_name: 'إدارة المنصة',
    role: 'super_admin',
    faculty_location_id: 'loc-main',
    is_active: true,
    permissions: ['all'],
    created_at: '2026-11-06T00:00:00Z',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-all',
    name_ar: 'الكل',
    name_en: 'All',
    slug: 'all',
    icon_name: 'LayoutGrid',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-services',
    name_ar: 'خدمات',
    name_en: 'Services',
    slug: 'services',
    icon_name: 'Settings',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-electronics',
    name_ar: 'إلكترونيات',
    name_en: 'Electronics',
    slug: 'electronics',
    icon_name: 'Gamepad2',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-clothing',
    name_ar: 'ملابس',
    name_en: 'Clothing',
    slug: 'clothing',
    icon_name: 'Shirt',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cat-stationery',
    name_ar: 'مستلزمات دراسية',
    name_en: 'Study Supplies',
    slug: 'study-supplies',
    icon_name: 'BookOpen',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'cat-food',
    name_ar: 'مأكولات ومشروبات',
    name_en: 'Food & Drinks',
    slug: 'food',
    icon_name: 'Utensils',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'cat-accessories',
    name_ar: 'إكسسوارات',
    name_en: 'Accessories',
    slug: 'accessories',
    icon_name: 'Watch',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 7,
    is_active: true,
  },
];

// Strictly zero demo stores, zero demo products, zero fake orders, zero fake reviews!
export const INITIAL_STORES: Store[] = [];
export const INITIAL_STORE_CATEGORIES: StoreCategory[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_INVITATIONS: StoreInvitation[] = [];
export const INITIAL_SUBSCRIPTIONS: StoreSubscription[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-campus-1',
    title_ar: 'كل احتياجاتك الجامعية في مكان واحد',
    subtitle_ar: 'منتجات • خدمات • مستلزمات دراسية • والمزيد',
    tags_ar: 'سوق الكلية الجامعي',
    cta_text_ar: 'تسوق الآن',
    target_link: '/stores',
    image_url: './banner-campus-hero.png',
    start_date: '2026-11-06',
    sort_order: 1,
    is_active: true,
  },
];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  revenue_model: 'hybrid',
  commission_rate_percent: 5,
  monthly_subscription_lyd: 50,
  currency_symbol_ar: 'د.ل',
  allow_demo_data: false,
};
