import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Heart,
  Bell,
  Package,
  LogOut,
  ShieldCheck,
  Briefcase,
  KeyRound,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  Sparkles,
  Store as StoreIcon,
  ChevronLeft,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    users,
    locations,
    products,
    stores,
    favoritesProductIds,
    favoritesStoreIds,
    unreadNotificationsCount,
    loginByEmail,
    switchQuickAccount,
    registerCustomer,
    registerMerchantByInvite,
    logout,
    updateUserProfile,
    showToast,
  } = useMarketplace();

  const [authTab, setAuthTab] = useState<
    'login' | 'register' | 'merchant_invite' | 'forgot'
  >('login');
  const [loginEmail, setLoginEmail] = useState('student@campus.edu.ly');
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regLocId, setRegLocId] = useState('loc-main');

  // Merchant Invite Registration State
  const [invToken, setInvToken] = useState('INV-DENTAL-2026');
  const [mOwnerName, setMOwnerName] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mStoreEn, setMStoreEn] = useState('');
  const [mStoreAr, setMStoreAr] = useState('');
  const [mActivity, setMActivity] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mCampusLoc, setMCampusLoc] = useState('داخل الكلية');
  const [mHours, setMHours] = useState('08:30 - 17:00');

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginByEmail(loginEmail);
    if (!res.success) setAuthError(res.error || 'خطأ في الدخول');
  };

  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName || !regEmail || !regPhone) {
      setAuthError('يرجى تعبئة جميع الحقول الأساسية.');
      return;
    }
    const res = registerCustomer({
      full_name: regName,
      email: regEmail,
      phone: regPhone,
      faculty_location_id: regLocId,
      student_id_number: regStudentId,
    });
    if (!res.success) setAuthError(res.error || 'تعذر التسجيل');
  };

  const handleMerchantInviteRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!invToken || !mOwnerName || !mEmail || !mStoreEn || !mActivity) {
      setAuthError('يرجى تعبئة رمز الدعوة وبيانات المتجر الأساسية.');
      return;
    }
    const res = registerMerchantByInvite({
      token: invToken,
      full_name: mOwnerName,
      email: mEmail,
      phone: mPhone || '0910000000',
      store_name_en: mStoreEn,
      store_name_ar: mStoreAr || mStoreEn,
      activity_type_ar: mActivity,
      description_ar: mDesc || mActivity,
      location_inside_campus: mCampusLoc,
      working_hours: mHours,
    });
    if (!res.success) setAuthError(res.error || 'تعذر تسجيل المتجر');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-28">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-header">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-extrabold text-slate-900">حسابي</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-5">
        {/* QUICK ROLE SWITCHER FOR TESTING ALL ROLES SEAMLESSLY */}
        <section className="bg-gradient-to-l from-brand-900 via-brand-800 to-slate-900 text-white rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-300" />
              <h2 className="text-xs font-extrabold">
                بوابة تبديل الحسابات السريعة (لاختبار جميع صلاحيات المنصة)
              </h2>
            </div>
            <span className="text-[10px] bg-white/15 px-2.5 py-0.5 rounded-full font-bold">
              RBAC Live Switcher
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {users.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              const roleBadge =
                u.role === 'super_admin'
                  ? 'مدير عام المنصة'
                  : u.role === 'merchant'
                  ? 'تاجر / صاحب متجر'
                  : 'طالب / مشتري';
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => switchQuickAccount(u.id)}
                  className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between ${
                    isCurrent
                      ? 'bg-white text-slate-900 border-white shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate">{u.full_name}</p>
                    <p
                      className={`text-[10px] font-bold ${
                        isCurrent ? 'text-brand-600' : 'text-brand-200'
                      }`}
                    >
                      {roleBadge}
                    </p>
                  </div>
                  {isCurrent && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* IF LOGGED OUT: SHOW AUTH FORMS */}
        {!currentUser ? (
          <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card max-w-lg mx-auto space-y-4">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-extrabold">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg transition ${
                  authTab === 'login'
                    ? 'bg-white text-brand-700 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg transition ${
                  authTab === 'register'
                    ? 'bg-white text-brand-700 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                حساب طالب جديد
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('merchant_invite');
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg transition ${
                  authTab === 'merchant_invite'
                    ? 'bg-white text-brand-700 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                تسجيل متجر بدعوة
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {authError}
              </div>
            )}

            {authTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني الجامعي أو الشخصي
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    defaultValue="12345678"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthTab('forgot')}
                    className="text-brand-600 font-bold hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold"
                >
                  دخول إلى المنصة
                </button>
              </form>
            )}

            {authTab === 'register' && (
              <form onSubmit={handleCustomerRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الثلاثي للطالب
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: محمد الفيتوري"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@campus.edu.ly"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف (ليبيا)
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="091XXXXXXX"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الكلية / الموقع الجامعي
                    </label>
                    <select
                      value={regLocId}
                      onChange={(e) => setRegLocId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم القيد الجامعي (اختياري)
                    </label>
                    <input
                      type="text"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="2024XXXX"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold"
                >
                  إنشاء حساب طالب جديد
                </button>
              </form>
            )}

            {authTab === 'merchant_invite' && (
              <form onSubmit={handleMerchantInviteRegister} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-100 text-[11px] text-brand-800 font-semibold">
                  يخضع إنشاء المتاجر لسيطرة إدارة المنصة. أدخل رمز الدعوة الممنوح لك
                  (مثال متاح للتجربة: <strong dir="ltr">INV-DENTAL-2026</strong>).
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز الدعوة الخاص بالتاجر (Invitation Token)
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={invToken}
                    onChange={(e) => setInvToken(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-brand-300 font-en font-bold text-xs bg-brand-50/30"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم صاحب المتجر
                    </label>
                    <input
                      type="text"
                      required
                      value={mOwnerName}
                      onChange={(e) => setMOwnerName(e.target.value)}
                      placeholder="د. طه السنوسي"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني للتاجر
                    </label>
                    <input
                      type="email"
                      required
                      value={mEmail}
                      onChange={(e) => setMEmail(e.target.value)}
                      placeholder="merchant@campus.edu.ly"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المتجر (بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      required
                      value={mStoreEn}
                      onChange={(e) => setMStoreEn(e.target.value)}
                      placeholder="DentalKit Store"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نوع النشاط (بالعربية)
                    </label>
                    <input
                      type="text"
                      required
                      value={mActivity}
                      onChange={(e) => setMActivity(e.target.value)}
                      placeholder="مستلزمات وأدوات طب الأسنان"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    وصف مختصر للمتجر
                  </label>
                  <input
                    type="text"
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    placeholder="نوفر جميع الأدوات السريرية والمخبرية لطلبة الكلية..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold"
                >
                  تفعيل المتجر والدخول للوحة التاجر
                </button>
              </form>
            )}

            {authTab === 'forgot' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  أدخل بريدك الإلكتروني الجامعي لإرسال رابط استعادة كلمة المرور:
                </p>
                <input
                  type="email"
                  placeholder="student@campus.edu.ly"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    showToast('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني');
                    setAuthTab('login');
                  }}
                  className="w-full h-10 rounded-xl bg-brand-600 text-white text-xs font-extrabold"
                >
                  إرسال رابط الاستعادة
                </button>
              </div>
            )}
          </section>
        ) : (
          /* IF LOGGED IN: SHOW PROFILE + ROLE DASHBOARD SHORTCUTS + FAVORITES */
          <div className="space-y-5">
            {/* User Card */}
            <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-xl">
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900">
                        {currentUser.full_name}
                      </h2>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        {currentUser.role === 'super_admin'
                          ? 'Super Admin'
                          : currentUser.role === 'admin'
                          ? 'Admin'
                          : currentUser.role === 'merchant'
                          ? 'حساب تاجر'
                          : 'حساب طالب'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {currentUser.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {currentUser.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileName(currentUser.full_name);
                      setProfilePhone(currentUser.phone);
                      setProfileLoc(currentUser.faculty_location_id);
                      setEditMode((prev) => !prev);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    {editMode ? 'إلغاء التعديل' : 'تعديل الحساب'}
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                  </button>
                </div>
              </div>

              {editMode && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      الكلية
                    </label>
                    <select
                      value={profileLoc}
                      onChange={(e) => setProfileLoc(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
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
                      className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-extrabold"
                    >
                      حفظ التغييرات
                    </button>
                  </div>
                </div>
              )}

              {/* Role Portal Cards (Merchant Dashboard / Admin Dashboard) */}
              {currentUser.role === 'merchant' && (
                <div
                  onClick={() => navigate('/merchant')}
                  className="p-4 rounded-2xl bg-gradient-to-l from-brand-700 to-brand-600 text-white flex items-center justify-between cursor-pointer shadow-sm hover:opacity-95 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold">
                        لوحة تحكم التاجر (Merchant Dashboard)
                      </h3>
                      <p className="text-xs text-brand-100">
                        إدارة منتجات متجرك، المخزون، الطلبات الواردة، والتقارير المالية
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5" />
                </div>
              )}

              {(currentUser.role === 'admin' ||
                currentUser.role === 'super_admin') && (
                <div
                  onClick={() => navigate('/admin')}
                  className="p-4 rounded-2xl bg-gradient-to-l from-slate-900 to-brand-900 text-white flex items-center justify-between cursor-pointer shadow-sm hover:opacity-95 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-brand-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold">
                        لوحة الإدارة الشاملة (Admin Command Center)
                      </h3>
                      <p className="text-xs text-slate-300">
                        إدارة المتاجر، دعوات التجار، التصنيفات، البانرات، العمولات، والتقارير
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5" />
                </div>
              )}

              {/* Quick Navigation Links */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-100 flex items-center gap-2.5 transition"
                >
                  <Package className="w-5 h-5 text-brand-600" />
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-800">طلباتي</p>
                    <p className="text-[10px] text-slate-400">متابعة وسجل الطلبات</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/notifications')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-100 flex items-center gap-2.5 transition"
                >
                  <Bell className="w-5 h-5 text-brand-600" />
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-800">
                      الإشعارات ({unreadNotificationsCount})
                    </p>
                    <p className="text-[10px] text-slate-400">تنبيهات الطلبات والعروض</p>
                  </div>
                </button>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <Building2 className="w-5 h-5 text-brand-600" />
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-800">
                      {locations.find((l) => l.id === currentUser.faculty_location_id)
                        ?.name_ar || 'داخل الكلية'}
                    </p>
                    <p className="text-[10px] text-slate-400">الموقع الجامعي الافتراضي</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Wishlist / Favorites Section (المفضلة) */}
            <section className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  المتاجر والمنتجات المفضلة
                </h2>
              </div>

              {favStores.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {favStores.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => navigate(`/store/${st.id}`)}
                      className="bg-white p-3 rounded-2xl border border-slate-100 shadow-card flex items-center justify-between cursor-pointer hover:border-brand-200 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={st.logo_url}
                          alt={st.name_en}
                          className="w-11 h-11 rounded-xl object-cover"
                        />
                        <div>
                          <h3 className="font-en font-extrabold text-sm text-slate-900">
                            {st.name_en}
                          </h3>
                          <p className="text-xs text-slate-500">{st.activity_type_ar}</p>
                        </div>
                      </div>
                      <StoreIcon className="w-4 h-4 text-brand-600" />
                    </div>
                  ))}
                </div>
              )}

              {favProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-xs text-slate-400">
                  لم تقم بإضافة منتجات إلى المفضلة بعد. اضغط على أيقونة القلب ❤️ على أي
                  منتج لحفظه هنا.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {favProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} showStoreName />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
