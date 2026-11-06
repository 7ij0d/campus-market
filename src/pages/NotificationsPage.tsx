import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
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
    <div className="min-h-screen bg-[#F8F7FC] pb-24">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-header">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h1 className="text-base font-extrabold text-slate-900">
              الإشعارات ({unreadNotificationsCount} غير مقروءة)
            </h1>
          </div>

          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span>تحديد الكل كمقروء</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-2.5">
        {userNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-card space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-extrabold text-slate-700">
              لا توجد إشعارات حالياً
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
                    ? 'bg-white border-slate-100 opacity-80'
                    : 'bg-brand-50/40 border-brand-200 shadow-card'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.is_read
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-brand-600 text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {notif.title_ar}
                    </h2>
                    {!notif.is_read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notif.message_ar}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
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
