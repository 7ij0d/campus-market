import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { BottomNavigation } from './components/BottomNavigation';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { StoreDetailsPage } from './pages/StoreDetailsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { AccountPage } from './pages/AccountPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MerchantDashboardPage } from './pages/MerchantDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ToastBanner: React.FC = () => {
  const { toastMessage } = useMarketplace();
  if (!toastMessage) return null;

  const bgClass =
    toastMessage.type === 'error'
      ? 'bg-rose-600 text-white'
      : toastMessage.type === 'info'
      ? 'bg-slate-900 text-white'
      : 'bg-brand-700 text-white';

  return (
    <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto px-4 py-2.5 rounded-2xl shadow-lg text-xs font-extrabold flex items-center gap-2 transition-all ${bgClass}`}
      >
        <span>{toastMessage.text}</span>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MarketplaceProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-[#F8F7FC] text-slate-900" dir="rtl">
          <ToastBanner />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/store/:storeId" element={<StoreDetailsPage />} />
              <Route path="/product/:productId" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/merchant" element={<MerchantDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <BottomNavigation />
        </div>
      </HashRouter>
    </MarketplaceProvider>
  );
};

export default App;
