import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { AppNavigation } from './components/BottomNavigation';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { StoreDetailsPage } from './pages/StoreDetailsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { AccountPage } from './pages/AccountPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RegisterStorePage } from './pages/RegisterStorePage';
import { MerchantDashboardPage } from './pages/MerchantDashboardPage';
import { MerchantLoginPage } from './pages/MerchantLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ToastBanner: React.FC = () => {
  const { toastMessage } = useMarketplace();
  if (!toastMessage) return null;

  const bgClass =
    toastMessage.type === 'error'
      ? 'bg-[#18343B] text-white border border-[#F3C95B]'
      : toastMessage.type === 'info'
      ? 'bg-[#18343B] text-white'
      : 'bg-[#087E83] text-white';

  return (
    <div className="fixed top-20 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto px-5 py-2.5 rounded-full shadow-lg text-xs font-extrabold flex items-center gap-2 transition-all ${bgClass}`}
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
        <ToastBanner />
        <AppNavigation>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/store/preview" element={<StoreDetailsPage />} />
            <Route path="/store/:storeId" element={<StoreDetailsPage />} />
            <Route path="/product/:productId" element={<ProductDetailsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/merchant" element={<MerchantDashboardPage />} />
            <Route path="/merchant-login" element={<MerchantLoginPage />} />
            <Route path="/register-store" element={<RegisterStorePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppNavigation>
      </HashRouter>
    </MarketplaceProvider>
  );
};

export default App;
