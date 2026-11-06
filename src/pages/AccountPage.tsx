import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Heart,
  Bell,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  Briefcase,
  MapPin,
  Settings,
  Headphones,
  Info,
  ChevronLeft,
  Ticket,
  Star,
  MessageSquare,
  Wallet,
  X,
  Upload,
  Trash2,
  Store as StoreIcon,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';
import { StoreCard } from '../components/StoreCard';
import { compressImageFile } from '../utils/imageUpload';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currentUser,
    locations,
    selectedLocationId,
    selectedPickupPoint,
    setSelectedLocationId,
    setSelectedPickupPoint,
    products,
    stores,
    favoritesProductIds,
    favoritesStoreIds,
    unreadNotificationsCount,
    loginByEmail,
    registerCustomer,
    registerMerchantByInvite,
    logout,
    updateUserProfile,
    showToast,
  } = useMarketplace();

  const [authModalMode, setAuthModalMode] = useState<
    null | 'login' | 'register' | 'merchant_invite'
  >(null);
  const [activeSubModal, setActiveSubModal] = useState<
    null | 'favorites' | 'locations' | 'settings' | 'support' | 'about' | 'coupons'
  >(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const becomeMerchant = searchParams.get('become_merchant');
    if (becomeMerchant === '1') {
      navigate('/register-store', { replace: true });
    } else if (tabParam === 'merchant_invite') {
      navigate('/register-store', { replace: true });
    }
  }, [searchParams, navigate]);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLocId, setRegLocId] = useState('loc-main');

  // Merchant Subscription / Onboarding State (Section 6)
  const [invToken, setInvToken] = useState('');
  const [mOwnerName, setMOwnerName] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mStoreName, setMStoreName] = useState('');
  const [mActivity, setMActivity] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mLocation, setMLocation] = useState('داخل الكلية');
  const [mLogoUrl, setMLogoUrl] = useState('');
  const [mCoverUrl, setMCoverUrl] = useState('');

  // Profile Edit State
  const [editMode, setEditMode] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileLoc, setProfileLoc] = useState(
    currentUser?.faculty_location_id || 'loc-main'
  );

  const favProducts = useMemo(
    () => products.filter((p) => favoritesProductIds.includes(p.id)),
    [products, favoritesProductIds]
  );

  const favStores = useMemo(
    () => stores.filter((s) => favoritesStoreIds.includes(s.id)),
    [stores, favoritesStoreIds]
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginByEmail(loginEmail);
    if (!res.success) {
      setAuthError(res.error || 'تعذر تسجيل الدخول');
    } else {
      setAuthModalMode(null);
    }
  };

  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName || !regEmail || !regPhone) {
      setAuthError('يرجى إدخال الاسم والبريد الإلكتروني ورقم الهاتف.');
      return;
    }
    const res = registerCustomer({
      full_name: regName,
      email: regEmail,
      phone: regPhone,
      faculty_location_id: regLocId,
    });
    if (!res.success) {
      setAuthError(res.error || 'تعذر إنشاء الحساب');
    } else {
      setAuthModalMode(null);
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 400, 0.85);
      setMLogoUrl(dataUrl);
    } catch {
      showToast('تعذر قراءة الصورة المصغرة', 'error');
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 600, 0.85);
      setMCoverUrl(dataUrl);
    } catch {
      showToast('تعذر قراءة صورة البانر', 'error');
    }
  };

  const handleMerchantInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!mOwnerName || !mEmail || !mPhone || !mStoreName) {
      setAuthError('يرجى تعبئة جميع الحقول الأساسية لتسجيل المتجر.');
      return;
    }
    const res = registerMerchantByInvite({
      token: invToken,
      full_name: mOwnerName,
      email: mEmail,
      phone: mPhone,
      store_name_en: mStoreName,
      store_name_ar: mStoreName,
      activity_type_ar: mActivity || 'متجر جامعي',
      description_ar: mDesc || mActivity || 'متجر داخل الكلية',
      location_inside_campus: mLocation || 'داخل الكلية',
      logo_url: mLogoUrl,
      cover_url: mCoverUrl,
    });
    if (!res.success) {
      setAuthError(res.error || 'تعذر تسجيل المتجر');
    } else {
      setAuthModalMode(null);
      navigate('/merchant');
    }
  };

  const mainMenuItems = [
    {
      id: 'orders',
      label: 'طلباتي',
      icon: ShoppingBag,
      action: () => navigate('/orders'),
    },
    {
      id: 'favorites',
      label: 'المفضلة',
      icon: Heart,
      action: () => setActiveSubModal('favorites'),
    },
    {
      id: 'locations',
      label: 'العناوين ونقاط الاستلام',
      icon: MapPin,
      action: () => setActiveSubModal('locations'),
    },
    {
      id: 'notifications',
      label: `الإشعارات${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount})` : ''}`,
      icon: Bell,
      action: () => navigate('/notifications'),
    },
    {
      id: 'coupons',
      label: 'الكوبونات والعروض',
      icon: Ticket,
      action: () => setActiveSubModal('coupons'),
    },
    {
      id: 'settings',
      label: 'الإعدادات واللغة',
      icon: Settings,
      action: () => setActiveSubModal('settings'),
    },
    {
      id: 'support',
      label: 'المساعدة والدعم',
      icon: Headphones,
      action: () => setActiveSubModal('support'),
    },
    {
      id: 'about',
      label: 'عن التطبيق والأحكام والشروط',
      icon: Info,
      action: () => setActiveSubModal('about'),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* TOP USER / GUEST PROFILE CARD */}
      <section className="bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#DCE8EA] text-[#6B8A8F] flex items-center justify-center mx-auto overflow-hidden">
          {currentUser ? (
            <span className="text-2xl font-extrabold text-[#087E83]">
              {currentUser.full_name.charAt(0)}
            </span>
          ) : (
            <UserIcon className="w-11 h-11 stroke-[1.8]" />
          )}
        </div>

        {!currentUser ? (
          <>
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-[#18343B]">مرحباً بك</h2>
              <p className="text-xs font-medium text-[#74838A]">
                سجل الدخول لإدارة حسابك أو الاشتراك بمتجرك
              </p>
            </div>

            <div className="space-y-2.5 max-w-xs mx-auto pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthModalMode('login');
                }}
                className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-xs transition active:scale-98"
              >
                تسجيل الدخول
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthModalMode('register');
                }}
                className="w-full h-11 rounded-full bg-white hover:bg-[#F0F7F7] text-[#087E83] border border-[#94C9CB] text-xs sm:text-sm font-extrabold transition active:scale-98"
              >
                إنشاء حساب جديد
              </button>

              <button
                type="button"
                onClick={() => navigate('/register-store')}
                className="w-full h-10 rounded-full bg-[#EAF3F4] hover:bg-[#DCEBED] text-[#087E83] text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
              >
                <StoreIcon className="w-3.5 h-3.5" />
                <span>اشترك بمتجرك في CampusMarket</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#18343B]">
                {currentUser.full_name}
              </h2>
              <p className="text-xs text-[#74838A] mt-0.5">
                {currentUser.email} {currentUser.phone ? `• ${currentUser.phone}` : ''}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setProfileName(currentUser.full_name);
                  setProfilePhone(currentUser.phone);
                  setProfileLoc(currentUser.faculty_location_id);
                  setEditMode((prev) => !prev);
                }}
                className="h-9 px-4 rounded-full bg-[#F0F7F7] hover:bg-[#E3EFEF] text-[#087E83] text-xs font-extrabold transition"
              >
                {editMode ? 'إلغاء التعديل' : 'تعديل المعلومات الشخصية'}
              </button>

              {currentUser.role === 'merchant' && (
                <button
                  type="button"
                  onClick={() => navigate('/merchant')}
                  className="h-9 px-4 rounded-full bg-[#087E83] text-white text-xs font-extrabold flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>لوحة صاحب المتجر</span>
                </button>
              )}

              {(currentUser.role === 'admin' ||
                currentUser.role === 'super_admin') && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="h-9 px-4 rounded-full bg-[#18343B] text-white text-xs font-extrabold flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة إدارة المنصة</span>
                </button>
              )}
            </div>

            {editMode && (
              <div className="pt-3 border-t border-[#E5EAED] text-right space-y-3 max-w-sm mx-auto">
                <div>
                  <label className="block text-[11px] font-bold text-[#74838A] mb-1">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#74838A] mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateUserProfile({
                      full_name: profileName,
                      phone: profilePhone,
                      faculty_location_id: profileLoc,
                    });
                    setEditMode(false);
                  }}
                  className="w-full h-10 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
                >
                  حفظ التغييرات
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* QUICK CARDS ROW */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="bg-white rounded-2xl p-3 border border-[#E5EAED] shadow-card hover:border-[#087E83] flex flex-col items-center justify-center gap-1.5 transition"
        >
          <ShoppingBag className="w-5 h-5 text-[#087E83]" />
          <span className="text-[11px] font-extrabold text-[#18343B]">طلباتي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubModal('favorites')}
          className="bg-white rounded-2xl p-3 border border-[#E5EAED] shadow-card hover:border-[#087E83] flex flex-col items-center justify-center gap-1.5 transition"
        >
          <Heart className="w-5 h-5 text-[#087E83]" />
          <span className="text-[11px] font-extrabold text-[#18343B]">المفضلة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubModal('support')}
          className="bg-white rounded-2xl p-3 border border-[#E5EAED] shadow-card hover:border-[#087E83] flex flex-col items-center justify-center gap-1.5 transition"
        >
          <Headphones className="w-5 h-5 text-[#087E83]" />
          <span className="text-[11px] font-extrabold text-[#18343B]">المساعدة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubModal('coupons')}
          className="bg-white rounded-2xl p-3 border border-[#E5EAED] shadow-card hover:border-[#087E83] flex flex-col items-center justify-center gap-1.5 transition"
        >
          <Wallet className="w-5 h-5 text-[#087E83]" />
          <span className="text-[11px] font-extrabold text-[#18343B]">المحفظة</span>
        </button>
      </div>

      {/* MAIN LIST CONTAINER */}
      <section className="bg-white rounded-3xl border border-[#E5EAED] shadow-card divide-y divide-[#E5EAED] overflow-hidden">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition text-right"
            >
              <div className="flex items-center gap-3.5">
                <Icon className="w-5 h-5 text-[#18343B] stroke-[1.8]" />
                <span className="text-xs sm:text-sm font-extrabold text-[#18343B]">
                  {item.label}
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#74838A]" />
            </button>
          );
        })}
      </section>

      {/* Admin & Merchant Portals Access Card */}
      <section className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[#18343B]">
              بوابة التجار وإدارة المنصة
            </h3>
            <p className="text-[11px] text-[#74838A]">
              الاشتراك كصاحب متجر أو الدخول إلى لوحة الإدارة المركزية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/register-store')}
            className="h-9 px-3.5 rounded-full bg-[#EAF3F4] hover:bg-[#DCEBED] text-[#087E83] text-xs font-extrabold transition"
          >
            اشتراك متجر جديد
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="h-9 px-4 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold transition"
          >
            لوحة الإدارة
          </button>
        </div>
      </section>

      {currentUser && (
        <button
          type="button"
          onClick={logout}
          className="w-full h-12 rounded-2xl bg-white hover:bg-[#F0F7F7] border border-[#E5EAED] text-[#18343B] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-card transition"
        >
          <LogOut className="w-4 h-4 text-[#74838A]" />
          <span>تسجيل الخروج</span>
        </button>
      )}

      {/* AUTH & MERCHANT ONBOARDING MODAL */}
      {authModalMode && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-xl border border-[#E5EAED] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
              <h3 className="text-base font-extrabold text-[#18343B]">
                {authModalMode === 'login'
                  ? 'تسجيل الدخول'
                  : authModalMode === 'register'
                  ? 'إنشاء حساب طالب جديد'
                  : 'اشتراك وإضافة متجر جديد في CampusMarket'}
              </h3>
              <button
                type="button"
                onClick={() => setAuthModalMode(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#74838A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-[#FDF8E7] border border-[#F3C95B] text-[#18343B] text-xs font-bold">
                {authError}
              </div>
            )}

            {authModalMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@campusmarket.ly"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E5EAED] text-xs focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E5EAED] text-xs focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold"
                >
                  تسجيل الدخول
                </button>
              </form>
            )}

            {authModalMode === 'register' && (
              <form onSubmit={handleCustomerRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="الاسم الثلاثي"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@university.edu.ly"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="091XXXXXXX"
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#18343B] mb-1">
                    الجامعة أو الكلية
                  </label>
                  <select
                    value={regLocId}
                    onChange={(e) => setRegLocId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs bg-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold"
                >
                  إنشاء الحساب
                </button>
              </form>
            )}

            {authModalMode === 'merchant_invite' && (
              <form onSubmit={handleMerchantInviteSubmit} className="space-y-4">
                {/* Live Store Card Preview */}
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E5EAED] space-y-2">
                  <span className="text-[11px] font-extrabold text-[#087E83] block">
                    معاينة بطاقة متجرك في الصفحة الرئيسية:
                  </span>
                  <StoreCard
                    previewMode
                    store={{
                      id: 'preview-store',
                      owner_id: 'preview',
                      name_ar: mStoreName || 'اسم المتجر',
                      name_en: mStoreName || 'اسم المتجر',
                      slug: 'preview',
                      activity_type_ar: mActivity || 'وصف النشاط',
                      description_ar: mDesc || 'وصف مختصر للمتجر',
                      category_id: 'cat-services',
                      logo_url: mLogoUrl,
                      cover_url: mCoverUrl,
                      icon_bg_color: '#087E83',
                      icon_type: 'sparkles',
                      location_inside_campus: mLocation,
                      is_open: true,
                      supports_pickup: true,
                      supports_delivery: true,
                      delivery_fee_lyd: 3,
                      contact_phone: mPhone,
                      status: 'active',
                      is_demo: false,
                      created_at: new Date().toISOString(),
                    }}
                  />
                </div>

                {/* Image Uploads: Thumbnail & Wide Banner (Section 6) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border border-[#E5EAED] bg-[#F8FAFC] space-y-2">
                    <label className="block text-xs font-extrabold text-[#18343B]">
                      أ. صورة المتجر المصغرة (الشعار)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 h-9 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة مصغرة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                      {mLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setMLogoUrl('')}
                          className="w-9 h-9 rounded-xl bg-white border border-[#E5EAED] text-rose-500 flex items-center justify-center"
                          title="حذف الصورة المصغرة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={mLogoUrl}
                      onChange={(e) => setMLogoUrl(e.target.value)}
                      placeholder="أو الصق رابط الصورة المصغرة..."
                      className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] bg-white text-[11px] font-en"
                    />
                  </div>

                  <div className="p-3 rounded-2xl border border-[#E5EAED] bg-[#F8FAFC] space-y-2">
                    <label className="block text-xs font-extrabold text-[#18343B]">
                      ب. صورة بانر المتجر العريضة
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 h-9 px-3 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة البانر</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileUpload}
                          className="hidden"
                        />
                      </label>
                      {mCoverUrl && (
                        <button
                          type="button"
                          onClick={() => setMCoverUrl('')}
                          className="w-9 h-9 rounded-xl bg-white border border-[#E5EAED] text-rose-500 flex items-center justify-center"
                          title="حذف البانر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={mCoverUrl}
                      onChange={(e) => setMCoverUrl(e.target.value)}
                      placeholder="أو الصق رابط صورة البانر..."
                      className="w-full h-8 px-2.5 rounded-lg border border-[#E5EAED] bg-white text-[11px] font-en"
                    />
                  </div>
                </div>

                {/* Store Details Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      اسم المتجر *
                    </label>
                    <input
                      type="text"
                      required
                      value={mStoreName}
                      onChange={(e) => setMStoreName(e.target.value)}
                      placeholder="مثال: كافيه الكلية / مكتبة الطالب"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      نوع النشاط *
                    </label>
                    <input
                      type="text"
                      required
                      value={mActivity}
                      onChange={(e) => setMActivity(e.target.value)}
                      placeholder="مثال: مأكولات ومشروبات / قرطاسية وطباعة"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      وصف مختصر للمتجر
                    </label>
                    <input
                      type="text"
                      value={mDesc}
                      onChange={(e) => setMDesc(e.target.value)}
                      placeholder="نبذة مختصرة تظهر للطلاب داخل صفحة المتجر..."
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      موقع المتجر داخل الجامعة *
                    </label>
                    <input
                      type="text"
                      required
                      value={mLocation}
                      onChange={(e) => setMLocation(e.target.value)}
                      placeholder="مثال: الساحة الطلابية / مبنى الهندسة"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      اسم صاحب المتجر *
                    </label>
                    <input
                      type="text"
                      required
                      value={mOwnerName}
                      onChange={(e) => setMOwnerName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      رقم التواصل *
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={mPhone}
                      onChange={(e) => setMPhone(e.target.value)}
                      placeholder="091XXXXXXX"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#18343B] mb-1">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={mEmail}
                      onChange={(e) => setMEmail(e.target.value)}
                      placeholder="store@campusmarket.ly"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#74838A] mb-1">
                      رمز دعوة التفعيل الفوري (اختياري)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={invToken}
                      onChange={(e) => setInvToken(e.target.value)}
                      placeholder="اتركه فارغاً لإرسال طلب اشتراك للإدارة"
                      className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-en"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-xs"
                >
                  حفظ بيانات المتجر والاشتراك الآن
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SUB-MODALS */}
      {activeSubModal && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-xl border border-[#E5EAED] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
              <h3 className="text-base font-extrabold text-[#18343B]">
                {activeSubModal === 'favorites'
                  ? 'المفضلة'
                  : activeSubModal === 'locations'
                  ? 'العناوين ونقاط الاستلام داخل الكلية'
                  : activeSubModal === 'settings'
                  ? 'الإعدادات واللغة'
                  : activeSubModal === 'support'
                  ? 'المساعدة والدعم'
                  : activeSubModal === 'coupons'
                  ? 'المحفظة والكوبونات'
                  : 'عن CampusMarket'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#74838A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeSubModal === 'favorites' && (
              <div className="space-y-4">
                {favStores.length === 0 && favProducts.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Heart className="w-9 h-9 text-[#087E83] mx-auto stroke-[1.7]" />
                    <p className="text-sm font-extrabold text-[#18343B]">
                      قائمة المفضلة فارغة حالياً
                    </p>
                  </div>
                ) : (
                  <>
                    {favStores.length > 0 && (
                      <div className="space-y-3">
                        {favStores.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              setActiveSubModal(null);
                              navigate(`/store/${st.id}`);
                            }}
                          >
                            <StoreCard store={st} />
                          </div>
                        ))}
                      </div>
                    )}
                    {favProducts.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {favProducts.map((p) => (
                          <ProductCard key={p.id} product={p} showStoreName />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeSubModal === 'locations' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#74838A]">
                  الموقع داخل الكلية:
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold bg-[#F8FAFC]"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name_ar}
                    </option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-[#74838A]">
                  نقطة الاستلام:
                </label>
                <select
                  value={selectedPickupPoint}
                  onChange={(e) => setSelectedPickupPoint(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold bg-white"
                >
                  {(
                    locations.find((l) => l.id === selectedLocationId) ||
                    locations[0]
                  ).pickup_points.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeSubModal === 'settings' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-between">
                  <span className="font-extrabold text-[#18343B]">اللغة</span>
                  <span className="font-bold text-[#087E83]">العربية (RTL)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-between">
                  <span className="font-extrabold text-[#18343B]">العملة</span>
                  <span className="font-bold text-[#087E83]">
                    الدينار الليبي (د.ل)
                  </span>
                </div>
              </div>
            )}

            {activeSubModal === 'coupons' && (
              <div className="py-6 text-center space-y-2">
                <Ticket className="w-8 h-8 text-[#087E83] mx-auto" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  لا توجد كوبونات مفعلة حالياً
                </p>
              </div>
            )}

            {activeSubModal === 'support' && (
              <div className="space-y-3 text-xs text-[#74838A]">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#18343B] font-extrabold">
                    <MessageSquare className="w-4 h-4 text-[#087E83]" />
                    <span>تواصل مع فريق دعم CampusMarket</span>
                  </div>
                  <p>البريد الإلكتروني: support@campusmarket.ly</p>
                </div>
              </div>
            )}

            {activeSubModal === 'about' && (
              <div className="space-y-3 text-xs text-[#74838A] leading-relaxed">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#18343B] font-extrabold">
                    <Star className="w-4 h-4 text-[#087E83]" />
                    <span>منصة CampusMarket — سوق الكلية الجامعي</span>
                  </div>
                  <p>
                    المنصة الجامعية الأولى التي تجمع متاجر ومشاريع الطلبة والخدمات
                    والمنتجات داخل الحرم الجامعي.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
