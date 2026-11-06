import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Store as StoreIcon,
  ShoppingCart,
  Package,
  User,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, currentUser } = useMarketplace();

  const navItems = [
    {
      key: 'home',
      label: 'الرئيسية',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      key: 'stores',
      label: 'المتاجر',
      path: '/stores',
      icon: StoreIcon,
      isActive:
        location.pathname.startsWith('/stores') || location.pathname.startsWith('/store/'),
    },
    {
      key: 'cart',
      label: 'السلة',
      path: '/cart',
      icon: ShoppingCart,
      badge: cartCount,
      isActive: location.pathname === '/cart' || location.pathname === '/checkout',
    },
    {
      key: 'orders',
      label: 'طلباتي',
      path: '/orders',
      icon: Package,
      isActive: location.pathname.startsWith('/orders'),
    },
    {
      key: 'account',
      label: 'حسابي',
      path: '/account',
      icon: User,
      isActive:
        location.pathname.startsWith('/account') ||
        location.pathname.startsWith('/favorites') ||
        location.pathname.startsWith('/notifications'),
    },
  ];

  return (
    <>
      {/* Quick Role Portal Bar if logged in as Merchant or Admin */}
      {(currentUser?.role === 'merchant' ||
        currentUser?.role === 'admin' ||
        currentUser?.role === 'super_admin') && (
        <div className="fixed bottom-[64px] inset-x-0 z-40 pointer-events-none flex justify-center px-4">
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-3 text-xs border border-white/10">
            <span className="text-slate-300 font-medium">
              وضع الحساب: <strong className="text-brand-300">{currentUser.full_name}</strong>
            </span>
            {currentUser.role === 'merchant' && (
              <button
                type="button"
                onClick={() => navigate('/merchant')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition ${
                  location.pathname.startsWith('/merchant')
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>لوحة المتجر</span>
              </button>
            )}
            {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>لوحة الإدارة</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav
        aria-label="التنقل الرئيسي"
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-100 shadow-nav h-16"
      >
        <div className="max-w-5xl mx-auto h-full grid grid-cols-5 items-center px-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center h-full gap-1 transition-colors ${
                  item.isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <IconComponent
                    className={`w-5 h-5 transition-transform ${
                      item.isActive ? 'stroke-[2.4] scale-105 text-brand-600' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -left-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
