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
  Globe,
  FileText,
  Star,
  MessageSquare,
  Wallet,
  X,
  Store as StoreIcon,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

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
    if (tabParam === 'merchant_invite') {
      setAuthModalMode('merchant_invite');
    }
  }, [searchParams]);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLocId, setRegLocId] = useState('loc-main');

  // Merchant Invite State
  const [invToken, setInvToken] = useState('');
  const [mOwnerName, setMOwnerName] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mStoreName, setMStoreName] = useState('');
  const [mActivity, setMActivity] = useState('');
  const [mDesc, setMDesc] = useState('');

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

  const handleMerchantInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!invToken || !mOwnerName || !mEmail || !mStoreName || !mActivity) {
      setAuthError('يرجى تعبئة جميع الحقول المطلوبة لتسجيل المتجر.');
      return;
    }
    const res = registerMerchantByInvite({
      token: invToken,
      full_name: mOwnerName,
      email: mEmail,
      phone: mPhone,
      store_name_en: mStoreName,
      store_name_ar: mStoreName,
      activity_type_ar: mActivity,
      description_ar: mDesc || mActivity,
      location_inside_campus: 'داخل الكلية',
      working_hours: '08:30 - 17:00',
    });
    if (!res.success) {
      setAuthError(res.error || 'رمز الدعوة غير صالح');
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
    <div className="space-y-4">
      {/* Mobile Header: حسابي (Matches Reference Image 3 Screen 4) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 h-14 flex items-center justify-center">
          <h1 className="text-[18px] font-extrabold text-[#18343B]">حسابي</h1>
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 max-w-2xl mx-auto space-y-5">
        {/* =====================================================================
            TOP USER / GUEST PROFILE CARD (Exact match to Reference Image 3 Screen 4)
        ===================================================================== */}
        <section className="bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card text-center space-y-4">
          {/* Circular User Avatar Silhouette */}
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
                  سجل الدخول لإدارة حسابك
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
                    <span>لوحة المتجر</span>
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
                  <div>
                    <label className="block text-[11px] font-bold text-[#74838A] mb-1">
                      الجامعة أو الكلية
                    </label>
                    <select
                      value={profileLoc}
                      onChange={(e) => setProfileLoc(e.target.value)}
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

        {/* =====================================================================
            QUICK CARDS ROW (المفضلة | طلباتي | المساعدة والدعم | المحفظة)
        ===================================================================== */}
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

        {/* =====================================================================
            MAIN LIST CONTAINER (Matches Reference Image 3 Screen 4)
        ===================================================================== */}
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

        {/* Admin & Merchant Portal Access Card */}
        <section className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#18343B]">
                إدارة المنصة والمتاجر
              </h3>
              <p className="text-[11px] text-[#74838A]">
                إضافة المتاجر والمنتجات والأقسام والبانرات من لوحة الإدارة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="h-9 px-4 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold shrink-0 transition"
          >
            لوحة الإدارة
          </button>
        </section>

        {/* Calm Logout Button at Bottom when Logged In (Requirement 12: No harsh red) */}
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
      </main>

      {/* =====================================================================
          AUTH MODAL (Login / Create Student Account / Merchant Invite)
      ===================================================================== */}
      {authModalMode && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-xl border border-[#E5EAED]">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
              <h3 className="text-base font-extrabold text-[#18343B]">
                {authModalMode === 'login'
                  ? 'تسجيل الدخول'
                  : authModalMode === 'register'
                  ? 'إنشاء حساب جديد'
                  : 'الانضمام كتاجر في CampusMarket'}
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
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('register')}
                    className="text-xs font-bold text-[#087E83] hover:underline"
                  >
                    ليس لديك حساب؟ إنشاء حساب جديد
                  </button>
                </div>
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
              <form onSubmit={handleMerchantInviteSubmit} className="space-y-3">
                <p className="text-xs text-[#74838A]">
                  أدخل رمز دعوة التاجر الصادر من إدارة المنصة لتسجيل متجرك:
                </p>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={invToken}
                  onChange={(e) => setInvToken(e.target.value)}
                  placeholder="Invitation Token"
                  className="w-full h-10 px-3 rounded-xl border border-[#94C9CB] text-xs font-en font-bold"
                />
                <input
                  type="text"
                  required
                  value={mOwnerName}
                  onChange={(e) => setMOwnerName(e.target.value)}
                  placeholder="اسم صاحب المتجر"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="email"
                  required
                  value={mEmail}
                  onChange={(e) => setMEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  required
                  value={mStoreName}
                  onChange={(e) => setMStoreName(e.target.value)}
                  placeholder="اسم المتجر"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <input
                  type="text"
                  required
                  value={mActivity}
                  onChange={(e) => setMActivity(e.target.value)}
                  placeholder="نوع النشاط أو الخدمة"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs"
                />
                <button
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold"
                >
                  تسجيل المتجر
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-MODALS FOR FAVORITES, LOCATIONS, SETTINGS, SUPPORT, ABOUT
      ===================================================================== */}
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
                    <p className="text-xs text-[#74838A]">
                      يمكنك حفظ المتاجر والمنتجات للوصول السريع إليها لاحقاً.
                    </p>
                  </div>
                ) : (
                  <>
                    {favStores.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold text-[#74838A]">
                          المتاجر المفضلة
                        </h4>
                        {favStores.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              setActiveSubModal(null);
                              navigate(`/store/${st.id}`);
                            }}
                            className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-xs font-extrabold text-[#18343B]">
                              {st.name_ar || st.name_en}
                            </span>
                            <ChevronLeft className="w-4 h-4 text-[#74838A]" />
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
                  الكلية المعتمدة:
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold bg-[#F8FAFC]"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name_ar} — {l.campus_name_ar}
                    </option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-[#74838A]">
                  نقطة الاستلام داخل الكلية:
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
                <Ticket className="w-9 h-9 text-[#087E83] mx-auto stroke-[1.7]" />
                <p className="text-sm font-extrabold text-[#18343B]">
                  لا توجد كوبونات فعالة حالياً
                </p>
                <p className="text-xs text-[#74838A]">
                  ستظهر قسائم الخصم والرصيد هنا فور توفرها.
                </p>
              </div>
            )}

            {activeSubModal === 'support' && (
              <div className="space-y-3 text-xs text-[#74838A] leading-relaxed">
                <p className="font-bold text-[#18343B]">
                  فريق دعم CampusMarket – سوق الكلية الجامعي
                </p>
                <p>
                  للاستفسارات المتعلقة بالطلبات أو الانضمام كتاجر داخل الحرم
                  الجامعي، يمكنك التواصل معنا مباشرة أو إرسال ملاحظاتك.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    showToast('تم إرسال رسالتك إلى فريق الدعم');
                    setActiveSubModal(null);
                  }}
                  className="w-full h-10 rounded-full bg-[#087E83] text-white font-extrabold"
                >
                  شارك ملاحظاتك معنا
                </button>
              </div>
            )}

            {activeSubModal === 'about' && (
              <div className="space-y-3 text-xs text-[#74838A] leading-relaxed">
                <p className="font-extrabold text-[#18343B]">
                  CampusMarket – سوق الكلية الجامعي
                </p>
                <p>
                  منصة إلكترونية تجمع احتياجات الطلبة الجامعية من منتجات وخدمات
                  ومستلزمات دراسية ومشاريع طلابية في مكان واحد داخل الكلية.
                </p>
                <div className="pt-2 border-t border-[#E5EAED] flex items-center justify-between text-[11px]">
                  <span>الأحكام والشروط • سياسة الخصوصية</span>
                  <span className="font-en font-bold text-[#087E83]">v2.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
