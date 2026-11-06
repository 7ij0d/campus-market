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
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const MerchantLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, merchantLogin, stores } = useMarketplace();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already logged in as merchant, navigate straight to merchant dashboard
  useEffect(() => {
    if (currentUser && currentUser.role === 'merchant' && currentUser.store_id) {
      navigate('/merchant', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو رمز المتجر.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('يرجى إدخال كلمة المرور.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = merchantLogin({
        identifier: identifier.trim(),
        password: password.trim(),
        rememberMe,
      });

      if (res.success) {
        navigate('/merchant', { replace: true });
      } else {
        setErrorMessage(res.error || 'فشل تسجيل الدخول. يرجى التأكد من البيانات.');
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

            {/* Store Awning Graphic */}
            <div className="w-24 h-24 mx-auto relative flex items-center justify-center mb-2">
              <div className="w-20 h-20 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center shadow-inner">
                <StoreIcon className="w-11 h-11 stroke-[1.8]" />
              </div>
              <span className="absolute -bottom-1 px-2.5 py-0.5 rounded-full bg-[#087E83] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                Merchant
              </span>
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
              {/* Identifier Input (Username or Store ID) */}
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1.5">
                  اسم المستخدم أو رمز المتجر
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="مثال: store_lama أو STR-104"
                    dir="ltr"
                    className="w-full h-12 pr-11 pl-4 rounded-2xl border border-[#E5EAED] bg-[#F8FAFC] focus:bg-white focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20 text-xs sm:text-sm font-semibold text-[#18343B] transition outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74838A] pointer-events-none">
                    <UserIcon className="w-5 h-5 stroke-[1.9]" />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full h-12 pr-11 pl-11 rounded-2xl border border-[#E5EAED] bg-[#F8FAFC] focus:bg-white focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20 text-xs sm:text-sm font-semibold text-[#18343B] transition outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74838A] pointer-events-none">
                    <Lock className="w-5 h-5 stroke-[1.9]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74838A] hover:text-[#18343B] transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md text-[#087E83] border-[#E5EAED] focus:ring-[#087E83]"
                  />
                  <span className="font-bold text-[#18343B]">تذكّرني</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-bold text-[#087E83] hover:underline"
                >
                  نسيت كلمة المرور؟
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
                    <span>تسجيل الدخول</span>
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
