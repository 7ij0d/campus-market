import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Store as StoreIcon,
  ShoppingCart,
  FileText,
  User,
  GraduationCap,
  Bell,
  Heart,
  Search,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  X,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AppNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cartCount,
    unreadNotificationsCount,
    favoritesProductIds,
    favoritesStoreIds,
    currentUser,
    locations,
    selectedLocationId,
    selectedPickupPoint,
    setSelectedLocationId,
    setSelectedPickupPoint,
  } = useMarketplace();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const currentLocation =
    locations.find((l) => l.id === selectedLocationId) || locations[0];

  const totalFavs = favoritesProductIds.length + favoritesStoreIds.length;

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
      key: 'search',
      label: 'البحث',
      path: '/search',
      icon: Search,
      isActive: location.pathname.startsWith('/search'),
      desktopOnly: true,
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
      icon: FileText,
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

  const mobileNavItems = navItems.filter((i) => !i.desktopOnly);

  const handleDesktopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      navigate('/search');
    }
  };

  // Hide global consumer navigation when inside dedicated Admin or Merchant full portals if needed,
  // or keep accessible so user can jump back seamlessly.
  const isPortalRoute =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/merchant');

  if (isPortalRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18343B] flex flex-col">
      {/* =====================================================================
          1. DESKTOP & LAPTOP TOP HEADER + SEARCH ROW (Matches Reference Image 2)
      ===================================================================== */}
      <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-[#E5EAED] shadow-header">
        <div className="max-w-7xl mx-auto px-6">
          {/* Row 1: Brand on Right | Navigation Pills in Center | Profile/Bell/Heart on Left */}
          <div className="h-16 flex items-center justify-between gap-6">
            {/* Right in RTL: Brand Logo */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-[#087E83] flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col text-right">
                <span
                  dir="ltr"
                  className="font-en text-[19px] font-extrabold tracking-tight text-[#18343B] leading-none"
                >
                  CampusMarket
                </span>
                <span className="text-xs font-bold text-[#74838A] mt-1 leading-none">
                  سوق الكلية الجامعي
                </span>
              </div>
            </div>

            {/* Center: Navigation Links matching Reference Image 2 */}
            <nav className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`h-10 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                  location.pathname === '/'
                    ? 'bg-[#087E83] text-white shadow-xs'
                    : 'text-[#18343B] hover:bg-[#F0F7F7] hover:text-[#087E83]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/stores')}
                className={`h-10 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                  location.pathname.startsWith('/stores') ||
                  location.pathname.startsWith('/store/')
                    ? 'bg-[#087E83] text-white shadow-xs'
                    : 'text-[#18343B] hover:bg-[#F0F7F7] hover:text-[#087E83]'
                }`}
              >
                <StoreIcon className="w-4 h-4" />
                <span>المتاجر</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className={`relative h-10 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                  location.pathname === '/cart'
                    ? 'bg-[#087E83] text-white shadow-xs'
                    : 'text-[#18343B] hover:bg-[#F0F7F7] hover:text-[#087E83]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>السلة</span>
                {cartCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#087E83] text-white text-[10px] font-extrabold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/orders')}
                className={`h-10 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                  location.pathname.startsWith('/orders')
                    ? 'bg-[#087E83] text-white shadow-xs'
                    : 'text-[#18343B] hover:bg-[#F0F7F7] hover:text-[#087E83]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>طلباتي</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/search')}
                className={`h-10 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                  location.pathname.startsWith('/search')
                    ? 'bg-[#087E83] text-white shadow-xs'
                    : 'text-[#18343B] hover:bg-[#F0F7F7] hover:text-[#087E83]'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>البحث</span>
              </button>
            </nav>

            {/* Left in RTL: Favorites + Notifications + User Profile */}
            <div className="flex items-center gap-2.5">
              {currentUser?.role === 'merchant' && (
                <button
                  type="button"
                  onClick={() => navigate('/merchant')}
                  className="h-9 px-3 rounded-xl bg-[#EAF3F4] text-[#087E83] hover:bg-[#087E83] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>لوحة المتجر</span>
                </button>
              )}

              {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="h-9 px-3 rounded-xl bg-[#18343B] text-white hover:bg-[#087E83] text-xs font-extrabold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/favorites')}
                aria-label="المفضلة"
                className="relative w-9 h-9 rounded-full hover:bg-[#F0F7F7] text-[#18343B] flex items-center justify-center transition"
              >
                <Heart className="w-5 h-5" />
                {totalFavs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#087E83] text-white text-[9px] font-extrabold flex items-center justify-center">
                    {totalFavs}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/notifications')}
                aria-label="الإشعارات"
                className="relative w-9 h-9 rounded-full hover:bg-[#F0F7F7] text-[#18343B] flex items-center justify-center transition"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-[#F3C95B] ring-2 ring-white" />
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/account')}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-[#F0F7F7] transition"
              >
                <div className="w-9 h-9 rounded-full bg-[#E3EFEF] text-[#087E83] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#74838A]" />
              </button>
            </div>
          </div>

          {/* Row 2 on Desktop: Wide Search Input + Campus Location Selector (Matches Reference Image 2) */}
          <div className="py-2.5 border-t border-[#E5EAED]/70 flex items-center gap-3">
            <form onSubmit={handleDesktopSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-[#74838A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="ابحث عن متجر أو منتج أو خدمة..."
                className="w-full h-11 pr-11 pl-4 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-xs font-medium text-[#18343B] placeholder:text-[#74838A] focus:outline-none focus:border-[#087E83] focus:bg-white transition"
              />
            </form>

            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="h-11 px-4 rounded-full bg-[#EAF3F4] hover:bg-[#dceBEC] text-[#18343B] border border-[#C5E0E1]/60 flex items-center gap-2 text-xs font-extrabold shrink-0 transition"
            >
              <MapPin className="w-4 h-4 text-[#087E83]" />
              <span>{currentLocation.name_ar}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#74838A]" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. MAIN WORKSPACE LAYOUT (Desktop Right Sidebar + Main Content Area)
      ===================================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex gap-6 lg:px-6 lg:py-5">
        {/* Desktop Fixed Right Sidebar (Matches Section 13 of Master Prompt) */}
        <aside className="hidden xl:flex flex-col w-60 shrink-0">
          <div className="sticky top-36 bg-white rounded-2xl border border-[#E5EAED] p-3 shadow-card space-y-1.5">
            <div className="px-3 py-2 border-b border-[#E5EAED]/80 mb-1">
              <p className="text-[11px] font-bold text-[#74838A]">القائمة السريعة</p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-extrabold transition ${
                    item.isActive
                      ? 'bg-[#EAF3F4] text-[#087E83]'
                      : 'text-[#18343B] hover:bg-[#F8FAFC] hover:text-[#087E83]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        item.isActive ? 'text-[#087E83] stroke-[2.3]' : 'text-[#74838A]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#087E83] text-white text-[10px] font-extrabold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 mt-3 border-t border-[#E5EAED]/80 space-y-1.5">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="w-full h-10 px-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-[#74838A] hover:bg-[#F0F7F7] hover:text-[#087E83] transition"
              >
                <ShieldCheck className="w-4 h-4 text-[#087E83]" />
                <span>لوحة إدارة المنصة</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex-1 min-w-0 pb-20 lg:pb-10">{children}</div>
      </div>

      {/* =====================================================================
          3. MOBILE & TABLET BOTTOM NAVIGATION BAR (Matches Reference Image 3)
      ===================================================================== */}
      <nav
        aria-label="التنقل السفلي"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#E5EAED] shadow-nav h-16"
      >
        <div className="max-w-xl mx-auto h-full grid grid-cols-5 items-center px-2">
          {mobileNavItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center h-full gap-1 transition-colors ${
                  item.isActive
                    ? 'text-[#087E83] font-extrabold'
                    : 'text-[#74838A] hover:text-[#18343B] font-semibold'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <IconComponent
                    className={`w-5 h-5 transition-transform ${
                      item.isActive
                        ? 'stroke-[2.4] scale-105 text-[#087E83]'
                        : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -left-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#087E83] text-white text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
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

      {/* CAMPUS LOCATION & PICKUP POINT MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-xl border border-[#E5EAED]">
            <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#087E83]" />
                <h3 className="text-base font-extrabold text-[#18343B]">
                  اختيار الجامعة أو الكلية ونقطة الاستلام
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#74838A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#74838A]">
                الكلية أو الحرم الجامعي:
              </label>
              <div className="space-y-2">
                {locations.map((loc) => {
                  const active = loc.id === selectedLocationId;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        if (loc.pickup_points.length > 0) {
                          setSelectedPickupPoint(loc.pickup_points[0]);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-right flex items-center justify-between transition ${
                        active
                          ? 'border-[#087E83] bg-[#F0F7F7] text-[#18343B]'
                          : 'border-[#E5EAED] hover:border-[#36A6A6] text-[#18343B]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-extrabold">{loc.name_ar}</p>
                        <p className="text-[11px] text-[#74838A]">{loc.campus_name_ar}</p>
                      </div>
                      {active && <Check className="w-4 h-4 text-[#087E83]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#74838A]">
                نقطة الاستلام داخل الكلية:
              </label>
              <select
                value={selectedPickupPoint}
                onChange={(e) => setSelectedPickupPoint(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-semibold text-[#18343B] bg-white focus:outline-none focus:border-[#087E83]"
              >
                {currentLocation.pickup_points.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              className="w-full h-11 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white font-bold text-xs shadow-xs transition"
            >
              تأكيد الموقع
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
