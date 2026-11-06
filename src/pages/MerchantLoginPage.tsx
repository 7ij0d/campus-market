import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store as StoreIcon,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  GraduationCap,
  ChevronLeft,
  AlertCircle,
  HelpCircle,
  X,
  PhoneCall,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const MerchantLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, merchantLogin, stores } = useMarketplace();

  const [storeCode, setStoreCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already logged in as merchant, navigate straight to merchant dashboard
  useEffect(() => {
    if (currentUser && currentUser.role === 'merchant' && currentUser.store_id) {
      navigate('/merchant', { replace: true });
    } else if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!storeCode.trim()) {
      setErrorMessage('يرجى إدخال رمز أو كود المتجر.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = merchantLogin({
        code: storeCode.trim(),
        rememberMe,
      });

      if (res.success) {
        if (res.isSuperAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/merchant', { replace: true });
        }
      } else {
        setErrorMessage(res.error || 'فشل تسجيل الدخول. يرجى التأكد من كود المتجر.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Background Decorative Teal Wave */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#087E83]/15 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-[32px] border border-[#E5EAED] shadow-xl overflow-hidden">
          {/* Header Graphic Section */}
          <div className="pt-8 pb-4 px-6 text-center bg-gradient-to-b from-[#F0F7F7] to-white relative">
            {/* CampusMarket Brand Header */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#087E83] text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-right">
                <h2 className="text-lg font-black text-[#18343B] tracking-tight leading-tight">
                  CampusMarket
                </h2>
                <span className="text-[11px] font-bold text-[#087E83] block">
                  سوق الكلية الجامعي
                </span>
              </div>
            </div>

            {/* Storefront & Campus Building Illustration */}
            <div className="w-48 h-28 mx-auto relative flex items-center justify-center my-2">
              <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Campus Silhouette */}
                <path d="M10 85V45L30 35L50 45V85H10Z" fill="#D7E9E8" />
                <rect x="18" y="52" width="6" height="8" rx="1" fill="#FFFFFF" opacity="0.8" />
                <rect x="36" y="52" width="6" height="8" rx="1" fill="#FFFFFF" opacity="0.8" />
                <rect x="18" y="66" width="6" height="8" rx="1" fill="#FFFFFF" opacity="0.8" />
                <rect x="36" y="66" width="6" height="8" rx="1" fill="#FFFFFF" opacity="0.8" />

                {/* Classical University Building */}
                <path d="M42 85V40L60 28L78 40V85H42Z" fill="#C5DFDE" />
                <polygon points="60,28 42,40 78,40" fill="#B2D5D4" />
                <line x1="48" y1="45" x2="48" y2="80" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
                <line x1="60" y1="45" x2="60" y2="80" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
                <line x1="72" y1="45" x2="72" y2="80" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />

                {/* Trees in background */}
                <circle cx="160" cy="55" r="14" fill="#CBE5E2" />
                <circle cx="178" cy="50" r="16" fill="#B8DCD8" />
                <rect x="158" y="68" width="4" height="17" fill="#9CBDB9" />
                <rect x="176" y="64" width="4" height="21" fill="#8CAEA9" />

                {/* Foreground Campus Store */}
                <rect x="70" y="50" width="60" height="35" rx="3" fill="#FFFFFF" stroke="#087E83" strokeWidth="1.5" />
                {/* Store Window */}
                <rect x="98" y="58" width="24" height="18" rx="2" fill="#EAF5F4" stroke="#087E83" strokeWidth="1" />
                <line x1="110" y1="58" x2="110" y2="76" stroke="#087E83" strokeWidth="1" strokeDasharray="1 1" />
                {/* Store Door */}
                <rect x="76" y="58" width="16" height="27" rx="1.5" fill="#F0F7F7" stroke="#087E83" strokeWidth="1" />
                <circle cx="79" cy="72" r="1" fill="#087E83" />

                {/* Striped Store Awning */}
                <path d="M66 50C66 45 70 41 74 41H126C130 41 134 45 134 50L130 53H70L66 50Z" fill="#087E83" />
                <path d="M68 53L70 41H78L75 53H68Z" fill="#06666A" />
                <path d="M84 41H92L90 53H82L84 41Z" fill="#36A6A6" />
                <path d="M98 41H106L104 53H96L98 41Z" fill="#06666A" />
                <path d="M112 41H120L118 53H110L112 41Z" fill="#36A6A6" />
                <path d="M126 41H132L128 53H124L126 41Z" fill="#06666A" />
                {/* Scalloped Awning Edge */}
                <path d="M68 53Q71 56 74 53Q77 56 80 53Q83 56 86 53Q89 56 92 53Q95 56 98 53Q101 56 104 53Q107 56 110 53Q113 56 116 53Q119 56 122 53Q125 56 128 53" stroke="#087E83" strokeWidth="2" fill="none" />

                {/* Ground Line */}
                <line x1="5" y1="85" x2="195" y2="85" stroke="#E5EAED" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Page Title & Subtitle matching the reference image */}
            <h1 className="text-2xl font-black text-[#18343B] mt-3">
              دخول أصحاب المتاجر
            </h1>
            <p className="text-xs text-[#74838A] mt-1 font-medium">
              سجّل دخولك لإدارة متجرك
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Single Store Code Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#18343B]">
                    رمز أو كود المتجر
                  </label>
                  <span className="text-[10px] text-[#087E83] font-extrabold bg-[#087E83]/10 px-2 py-0.5 rounded-full">
                    دخول سريع بدون يوزر
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={storeCode}
                    onChange={(e) => setStoreCode(e.target.value)}
                    placeholder="مثال: STR-1001 أو رمزك الخاص"
                    dir="ltr"
                    autoFocus
                    className="w-full h-13 pr-11 pl-4 rounded-2xl border border-[#E5EAED] bg-[#F8FAFC] focus:bg-white focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20 text-sm sm:text-base font-extrabold text-[#18343B] text-center tracking-wider transition outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74838A] pointer-events-none">
                    <KeyRound className="w-5 h-5 stroke-[1.9] text-[#087E83]" />
                  </div>
                </div>
                <p className="text-[11px] text-[#74838A] mt-1.5 font-medium leading-relaxed">
                  اكتب كود المتجر الخاص بك للدخول المباشر إلى لوحة التحكم فوراً.
                </p>
              </div>

              {/* Remember Me & Help Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md text-[#087E83] border-[#E5EAED] focus:ring-[#087E83]"
                  />
                  <span className="font-bold text-[#18343B]">تذكّرني على هذا الجهاز</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-bold text-[#087E83] hover:underline"
                >
                  نسيت رمز المتجر؟
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full bg-[#087E83] hover:bg-[#06666A] active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 stroke-[2.2]" />
                    <span>تسجيل الدخول إلى المتجر</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Card: "ليس لديك متجر بعد؟ قدّم طلب إنشاء متجر" */}
          <div className="p-5 bg-[#F8FAFC] border-t border-[#E5EAED]">
            <Link
              to="/register-store"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#F0F7F7] border border-[#E5EAED] transition group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center group-hover:scale-105 transition">
                  <StoreIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#74838A]">
                    ليس لديك متجر بعد؟
                  </div>
                  <div className="text-xs font-extrabold text-[#18343B] group-hover:text-[#087E83] transition">
                    قدّم طلب إنشاء متجر
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#74838A] group-hover:text-[#087E83] group-hover:translate-x-1 transition">
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Support Footer Note */}
        <div className="text-center mt-5 text-[11px] text-[#74838A]">
          تواجه مشكلة في الدخول لمتجرك؟{' '}
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-[#087E83] font-bold hover:underline"
          >
            تواصل مع إدارة منصة الكلية
          </button>
        </div>
      </div>

      {/* Forgot Password / Help Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 border border-[#E5EAED] shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#E5EAED] flex items-center justify-center text-[#74838A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#18343B]">
                استعادة حساب المتجر
              </h3>
              <p className="text-xs text-[#74838A] leading-relaxed">
                بيانات الدخول الخاصة بالمتاجر يتم إصدارها واعتمادها من قبل إدارة الكلية. في حال نسيت كلمة المرور، يمكنك طلب إعادة تعيينها مباشرة عبر المشرفين:
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#18343B] font-bold">
                <PhoneCall className="w-4 h-4 text-[#087E83]" />
                <span>دعم إدارة المنصة الجامعية</span>
              </div>
              <p className="text-[#74838A] text-[11px]">
                تواصل مع منسق السوق بالكلية أو زُر مكتب اتحاد الطلبة لإصدار كلمة مرور مؤقتة لمتجرك.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full h-10 rounded-full bg-[#087E83] text-white text-xs font-bold hover:bg-[#06666A]"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
