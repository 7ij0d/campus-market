import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Store,
  ClipboardList,
  User,
  ShoppingCart,
  Bell,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  X,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AppNavigation: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cartCount,
    unreadNotificationsCount,
    currentUser,
    headerSearchQuery,
    setHeaderSearchQuery,
  } = useMarketplace();

  const pathname = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const isAdmin =
    currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isMerchant = currentUser?.role === 'merchant';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#18343B]" dir="rtl">
      {/* Main Top Header (Matches Presto Reference Image across Mobile, Tablet, Laptop) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5EAED]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          {/* Right: CampusMarket Logo */}
          <button
            type="button"
            onClick={() => {
              setHeaderSearchQuery('');
              navigate('/');
            }}
            className="flex items-center gap-2.5 text-right shrink-0 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center shadow-2xs group-hover:bg-[#087E83] group-hover:text-white transition-colors">
              <GraduationCap className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <span
                dir="ltr"
                className="font-en text-base sm:text-lg font-extrabold text-[#18343B] tracking-tight block leading-none"
              >
                CampusMarket
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#087E83] block mt-1">
                سوق الكلية الجامعي
              </span>
            </div>
          </button>

          {/* Center: Clean Pill Search Bar ("ابحث عن متجر...") */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#18343B] absolute right-4 pointer-events-none" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => {
                  setHeaderSearchQuery(e.target.value);
                  if (pathname !== '/' && pathname !== '/stores') {
                    navigate('/');
                  }
                }}
                placeholder="ابحث عن متجر..."
                className="w-full h-10 sm:h-11 pr-10 pl-8 rounded-full bg-[#F8FAFC] border border-[#E5EAED] focus:bg-white focus:border-[#087E83] text-xs sm:text-sm font-semibold text-[#18343B] placeholder:text-[#74838A] outline-none transition shadow-2xs"
              />
              {headerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setHeaderSearchQuery('')}
                  className="absolute left-3 text-[#74838A] hover:text-[#18343B]"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Left: Quick Role Pills + Cart + Bell + Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isMerchant && (
              <button
                type="button"
                onClick={() => navigate('/merchant')}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#EAF3F4] text-[#087E83] text-xs font-extrabold hover:bg-[#087E83] hover:text-white transition"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>لوحة المتجر</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#18343B] text-white text-xs font-extrabold hover:bg-[#087E83] transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>لوحة الإدارة</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label="السلة"
              className="relative w-10 h-10 rounded-full hover:bg-[#F8FAFC] flex items-center justify-center text-[#18343B] transition"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#087E83] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications Bell Button */}
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label="الإشعارات"
              className="relative w-10 h-10 rounded-full hover:bg-[#F8FAFC] flex items-center justify-center text-[#18343B] transition"
            >
              <Bell className="w-5 h-5" strokeWidth={2} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* User Account Circle Button */}
            <button
              type="button"
              onClick={() => navigate('/account')}
              aria-label="حسابي"
              className="w-10 h-10 rounded-full bg-[#EAF3F4] text-[#087E83] hover:bg-[#087E83] hover:text-white flex items-center justify-center transition"
            >
              <User className="w-5 h-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pb-12">
        {children}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="التنقل السفلي"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EAED] shadow-bottom-nav"
      >
        <div className="max-w-lg mx-auto px-2 h-16 grid grid-cols-5 items-center">
          {[
            { label: 'الرئيسية', path: '/', icon: Home },
            { label: 'المتاجر', path: '/stores', icon: Store },
            { label: 'السلة', path: '/cart', icon: ShoppingCart, badge: cartCount },
            { label: 'طلباتي', path: '/orders', icon: ClipboardList },
            { label: 'حسابي', path: '/account', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
                  active
                    ? 'text-[#087E83]'
                    : 'text-[#74838A] hover:text-[#18343B]'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.9} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#087E83] text-white text-[9px] font-extrabold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] ${
                    active ? 'font-extrabold text-[#087E83]' : 'font-semibold'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export const BottomNavigation = AppNavigation;
