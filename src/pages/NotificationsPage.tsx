import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ArrowRight,
  CheckCheck,
  Package,
  Tag,
  Megaphone,
  Store as StoreIcon,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useMarketplace();

  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications
      .filter((n) => n.user_id === currentUser.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [currentUser, notifications]);

  return (
    <div className="space-y-4">
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <h1 className="text-base font-extrabold text-[#18343B]">
              الإشعارات
            </h1>
          </div>

          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-xs font-extrabold text-[#087E83] flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span>تحديد الكل كمقروء</span>
            </button>
          )}
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 max-w-3xl mx-auto space-y-3">
        {userNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl py-14 px-6 text-center border border-[#E5EAED] shadow-card space-y-2.5">
            <div className="w-14 h-14 rounded-2xl bg-[#F0F7F7] border border-[#C5E0E1] text-[#087E83] flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7 stroke-[1.7]" />
            </div>
            <p className="text-base font-extrabold text-[#18343B]">
              لا توجد إشعارات حالياً
            </p>
            <p className="text-xs text-[#74838A]">
              ستصلك هنا تنبيهات حالة الطلبات والعروض الجديدة فور توفرها.
            </p>
          </div>
        ) : (
          userNotifications.map((notif) => {
            const Icon =
              notif.type === 'order_update'
                ? Package
                : notif.type === 'merchant_order'
                ? StoreIcon
                : notif.type === 'offer'
                ? Tag
                : Megaphone;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.type === 'merchant_order') {
                    navigate('/merchant');
                  } else if (notif.related_order_id) {
                    navigate('/orders');
                  }
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  notif.is_read
                    ? 'bg-white border-[#E5EAED]'
                    : 'bg-[#F0F7F7] border-[#94C9CB] shadow-card'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.is_read
                      ? 'bg-[#F8FAFC] text-[#74838A]'
                      : 'bg-[#087E83] text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs sm:text-sm font-extrabold text-[#18343B]">
                      {notif.title_ar}
                    </h2>
                    {!notif.is_read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#087E83] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#74838A] leading-relaxed">
                    {notif.message_ar}
                  </p>
                  <span className="text-[10px] text-[#74838A] block">
                    {new Date(notif.created_at).toLocaleString('ar-LY', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};
