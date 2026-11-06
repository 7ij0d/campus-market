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

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  revenue_model: 'hybrid',
  commission_rate_percent: 5,
  monthly_subscription_lyd: 50,
  currency_symbol_ar: 'د.ل',
  allow_demo_data: false,
};

export const INITIAL_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-main',
    name_ar: 'داخل الكلية',
    campus_name_ar: 'الحرم الجامعي الرئيسي',
    pickup_points: [
      'البوابة الرئيسية للكلية',
      'الساحة الطلابية المركزية',
      'مبنى القاعات الدراسية',
      'مكتبة الكلية',
    ],
    is_active: true,
  },
  {
    id: 'loc-it',
    name_ar: 'مبنى تقنية المعلومات',
    campus_name_ar: 'الحرم الجامعي الرئيسي',
    pickup_points: ['مدخل المعامل', 'القاعة الكبرى'],
    is_active: true,
  },
  {
    id: 'loc-eng',
    name_ar: 'مبنى الهندسة',
    campus_name_ar: 'الحرم الجامعي الرئيسي',
    pickup_points: ['بهو الهندسة', 'المعمل المركزي'],
    is_active: true,
  },
  {
    id: 'loc-med',
    name_ar: 'مجمع الكليات الطبية',
    campus_name_ar: 'المجمع الطبي',
    pickup_points: ['بوابة الطب البشري', 'بوابة طب الأسنان'],
    is_active: true,
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-all',
    name_ar: 'الكل',
    name_en: 'All',
    slug: 'all',
    icon_name: 'LayoutGrid',
    color_bg: '#087E83',
    color_text: '#FFFFFF',
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
    slug: 'food-drinks',
    icon_name: 'Utensils',
    color_bg: '#EAF3F4',
    color_text: '#087E83',
    sort_order: 6,
    is_active: true,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-super-admin',
    email: 'admin@campusmarket.ly',
    phone: '0910000001',
    full_name: 'إدارة المنصة — CampusMarket',
    role: 'super_admin',
    faculty_location_id: 'loc-main',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
];

// Strictly empty: zero demo stores, zero demo products, zero fake orders, zero fake ratings
export const INITIAL_STORES: Store[] = [];
export const INITIAL_STORE_CATEGORIES: StoreCategory[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_INVITATIONS: StoreInvitation[] = [];
export const INITIAL_SUBSCRIPTIONS: StoreSubscription[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title_ar: 'كل احتياجاتك الجامعية في مكان واحد',
    subtitle_ar: 'منتجات • خدمات • مستلزمات دراسية والمزيد',
    tags_ar: 'CampusMarket',
    cta_text_ar: 'اكتشف المتاجر',
    target_link: '/stores',
    image_url: '/campus-market/banner-campus-art.jpg',
    start_date: '2026-01-01',
    end_date: '2027-12-31',
    sort_order: 1,
    is_active: true,
  },
];
