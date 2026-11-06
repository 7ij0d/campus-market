import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  LogIn,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, adminLogin } = useMarketplace();

  const [adminCode, setAdminCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as admin/super_admin, navigate directly to /admin/dashboard
  useEffect(() => {
    if (
      currentUser &&
      (currentUser.role === 'admin' || currentUser.role === 'super_admin')
    ) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminCode.trim()) {
      setErrorMessage('يرجى إدخال رمز الدخول (9922).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = adminLogin({
        code: adminCode.trim(),
      });

      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMessage(res.error || 'رمز الدخول غير صحيح.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute top-0 inset-x-0 h-52 bg-gradient-to-b from-[#18343B]/10 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] border border-[#E5EAED] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="pt-8 pb-5 px-6 text-center bg-gradient-to-b from-[#18343B] to-[#22444C] text-white relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black tracking-tight leading-tight">
                  CampusMarket
                </h3>
                <span className="text-[10px] text-[#A2D2D4] font-bold">
                  النظام الإداري المركزي
                </span>
              </div>
            </div>

            <div className="w-20 h-20 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
              <ShieldCheck className="w-10 h-10 stroke-[2] text-[#F3C95B]" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black">
              دخول التاجر الرئيسي والمشرف العام
            </h1>
            <p className="text-xs text-[#B9DDE0] mt-1 font-medium">
              لوحة التحكم المركزية لصاحب المنصة والمشرف
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Master PIN Banner */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-[#18343B] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F3C95B]" />
                  رمز دخول صاحب الموقع المعتمد:
                </span>
                <span className="text-[11px] bg-[#18343B] text-white px-2.5 py-0.5 rounded-full font-mono font-black">
                  9922
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminCode('9922');
                  const res = adminLogin({
                    code: '9922',
                  });
                  if (res.success) {
                    navigate('/admin/dashboard', { replace: true });
                  } else {
                    setErrorMessage(res.error || 'فشل تسجيل الدخول.');
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#087E83] hover:bg-[#066569] active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>دخول مباشر بالرمز (9922)</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#18343B] mb-1.5">
                  أدخل رمز الدخول (PIN Code)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="9922"
                    dir="ltr"
                    autoFocus
                    className="w-full h-13 pr-11 pl-4 rounded-2xl border border-[#E5EAED] bg-[#F8FAFC] focus:bg-white focus:border-[#18343B] focus:ring-2 focus:ring-[#18343B]/20 text-base font-extrabold text-center tracking-widest text-[#18343B] transition outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74838A] pointer-events-none">
                    <KeyRound className="w-5 h-5 text-[#18343B]" />
                  </div>
                </div>
                <p className="text-[11px] text-[#74838A] mt-1.5 text-center font-medium">
                  رمز صاحب الموقع هو <strong className="text-[#087E83] font-mono">9922</strong> بدون الحاجة لاسم مستخدم أو بريد.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full bg-[#18343B] hover:bg-[#0F2227] active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#F3C95B]" />
                    <span>تأكيد الرمز والدخول إلى لوحة الإدارة</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-4 bg-[#F8FAFC] border-t border-[#E5EAED] text-center text-xs text-[#74838A]">
            الوصول مقيد ومحمي ببروتوكولات الأمان الخاصة بإدارة الحرم الجامعي.
          </div>
        </div>

        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-xs font-bold text-[#74838A] hover:text-[#18343B] inline-flex items-center gap-1 transition"
          >
            <span>العودة لواجهة الزبائن والطلبة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
