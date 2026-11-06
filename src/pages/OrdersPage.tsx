import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Store as StoreIcon,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  History,
  RefreshCw,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Order, OrderStatus } from '../types/database';

export const STATUS_META: Record<
  OrderStatus,
  { label: string; colorClass: string; badgeBg: string }
> = {
  pending_review: {
    label: 'قيد المراجعة',
    colorClass: 'text-[#18343B]',
    badgeBg: 'bg-[#FDF8E7] border-[#F3C95B]',
  },
  accepted: {
    label: 'تم قبول الطلب',
    colorClass: 'text-[#087E83]',
    badgeBg: 'bg-[#EAF3F4] border-[#C5E0E1]',
  },
  preparing: {
    label: 'قيد التجهيز',
    colorClass: 'text-[#087E83]',
    badgeBg: 'bg-[#EAF3F4] border-[#C5E0E1]',
  },
  ready_for_pickup: {
    label: 'جاهز للاستلام',
    colorClass: 'text-[#087E83]',
    badgeBg: 'bg-[#EAF3F4] border-[#C5E0E1]',
  },
  out_for_delivery: {
    label: 'قيد التوصيل',
    colorClass: 'text-[#087E83]',
    badgeBg: 'bg-[#EAF3F4] border-[#C5E0E1]',
  },
  completed: {
    label: 'تم التسليم',
    colorClass: 'text-[#087E83]',
    badgeBg: 'bg-[#EAF3F4] border-[#94C9CB]',
  },
  rejected: {
    label: 'ملغي',
    colorClass: 'text-[#74838A]',
    badgeBg: 'bg-[#F8FAFC] border-[#E5EAED]',
  },
  cancelled: {
    label: 'ملغي',
    colorClass: 'text-[#74838A]',
    badgeBg: 'bg-[#F8FAFC] border-[#E5EAED]',
  },
};

type OrdersFilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    orders,
    products,
    reviews,
    addToCart,
    updateOrderStatus,
    submitReview,
    showToast,
  } = useMarketplace();

  const [tab, setTab] = useState<OrdersFilterTab>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState('');

  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders
      .filter((o) => o.customer_id === currentUser.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [currentUser, orders]);

  const displayedOrders = useMemo(() => {
    switch (tab) {
      case 'active':
        return myOrders.filter((o) =>
          [
            'pending_review',
            'accepted',
            'preparing',
            'ready_for_pickup',
            'out_for_delivery',
          ].includes(o.status)
        );
      case 'completed':
        return myOrders.filter((o) => o.status === 'completed');
      case 'cancelled':
        return myOrders.filter((o) =>
          ['cancelled', 'rejected'].includes(o.status)
        );
      default:
        return myOrders;
    }
  }, [myOrders, tab]);

  const handleReorder = (order: Order) => {
    let addedCount = 0;
    for (const item of order.items) {
      const liveProd = products.find((p) => p.id === item.product_id);
      if (
        liveProd &&
        liveProd.is_active &&
        liveProd.is_available_for_sale &&
        liveProd.stock_quantity > 0
      ) {
        addToCart(liveProd, 1, item.selected_options_snapshot || {}, {});
        addedCount++;
      }
    }
    if (addedCount > 0) {
      navigate('/cart');
    } else {
      showToast('عذراً، منتجات هذا الطلب غير متوفرة حالياً لإعادة الطلب', 'info');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingOrder) return;
    const res = submitReview({
      orderId: reviewingOrder.id,
      storeId: reviewingOrder.store_id,
      productId: reviewingOrder.items[0]?.product_id,
      rating: ratingVal,
      comment: commentVal,
    });
    if (res.success) {
      setReviewingOrder(null);
      setCommentVal('');
      setRatingVal(5);
    }
  };

  return (
    <div className="space-y-4">
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-extrabold text-[#18343B]">طلباتي</h1>
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 space-y-4">
        {/* 4 Tabs: جميع الطلبات | الطلبات الحالية | الطلبات المكتملة | الطلبات الملغاة */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white p-1.5 rounded-2xl border border-[#E5EAED] shadow-card">
          {(
            [
              { id: 'all', label: 'جميع الطلبات' },
              { id: 'active', label: 'الطلبات الحالية' },
              { id: 'completed', label: 'الطلبات المكتملة' },
              { id: 'cancelled', label: 'الطلبات الملغاة' },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  active
                    ? 'bg-[#087E83] text-white shadow-2xs'
                    : 'text-[#74838A] hover:text-[#18343B]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Orders List or Professional Empty State (Matches Section 11 & 15) */}
        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl py-16 px-6 text-center border border-[#E5EAED] shadow-card max-w-xl mx-auto my-4 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F7F7] border border-[#C5E0E1] text-[#087E83] flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 stroke-[1.7]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#18343B]">
              لا توجد طلبات حالياً
            </h2>
            <p className="text-xs sm:text-sm text-[#74838A] max-w-xs mx-auto">
              ستظهر طلباتك هنا عند إجراء أول عملية شراء.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/stores')}
                className="inline-flex items-center px-6 h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold transition"
              >
                تصفح المتاجر والمنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {displayedOrders.map((order) => {
              const meta = STATUS_META[order.status];
              const isExpanded = expandedOrderId === order.id;
              const hasReviewed = currentUser
                ? reviews.some(
                    (r) =>
                      r.order_id === order.id && r.user_id === currentUser.id
                  )
                : false;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E5EAED] shadow-card overflow-hidden"
                >
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          dir="ltr"
                          className="font-en text-xs font-extrabold text-[#087E83] bg-[#EAF3F4] px-3 py-1 rounded-full"
                        >
                          #{order.order_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/store/${order.store_id}`)}
                          className="text-sm font-extrabold text-[#18343B] hover:text-[#087E83] flex items-center gap-1.5"
                        >
                          <StoreIcon className="w-4 h-4 text-[#087E83]" />
                          {order.store_name_snapshot}
                        </button>
                      </div>

                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${meta.badgeBg} ${meta.colorClass}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#74838A]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#087E83]" />
                          {new Date(order.created_at).toLocaleString('ar-LY', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-[#087E83]" />
                          {order.fulfillment_method === 'campus_delivery'
                            ? 'توصيل داخل الكلية'
                            : 'استلام من المتجر'}
                        </span>
                      </div>

                      <span className="text-sm font-extrabold text-[#18343B]">
                        {order.total_lyd} د.ل
                      </span>
                    </div>

                    {/* Action Buttons on Card: View Details + Reorder */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E5EAED]">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order.id)
                        }
                        className="text-xs font-extrabold text-[#087E83] flex items-center gap-1"
                      >
                        <span>
                          {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="h-8 px-3.5 rounded-full bg-[#F0F7F7] hover:bg-[#E3EFEF] text-[#087E83] text-xs font-extrabold flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>إعادة الطلب</span>
                        </button>

                        {order.status === 'pending_review' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                'cancelled',
                                'تم إلغاء الطلب من قبل المستخدم'
                              )
                            }
                            className="h-8 px-3.5 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] hover:text-[#18343B] text-xs font-bold transition"
                          >
                            إلغاء الطلب
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-[#E5EAED] bg-[#F8FAFC] space-y-3.5">
                      <div className="space-y-2">
                        <h3 className="text-xs font-extrabold text-[#18343B]">
                          المنتجات:
                        </h3>
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-[#E5EAED] text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.product_image_snapshot}
                                alt={item.product_name_snapshot}
                                className="w-11 h-11 rounded-xl object-cover border border-[#E5EAED]"
                              />
                              <div>
                                <p className="font-extrabold text-[#18343B]">
                                  {item.product_name_snapshot}{' '}
                                  <span className="text-[#087E83]">
                                    × {item.quantity}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <span className="font-extrabold text-[#18343B]">
                              {item.line_total_lyd} د.ل
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-[#E5EAED] space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#18343B]">
                          <History className="w-3.5 h-3.5 text-[#087E83]" />
                          <span>سجل حالة الطلب:</span>
                        </div>
                        <div className="space-y-1.5 pr-2 border-r-2 border-[#94C9CB]">
                          {order.status_history.map((h) => (
                            <div
                              key={h.id}
                              className="text-[11px] flex items-center justify-between"
                            >
                              <span className="font-bold text-[#18343B]">
                                {STATUS_META[h.status]?.label || h.status}
                              </span>
                              <span className="text-[10px] text-[#74838A]">
                                {new Date(h.created_at).toLocaleTimeString(
                                  'ar-LY',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.status === 'completed' && !hasReviewed && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setReviewingOrder(order)}
                            className="h-9 px-4 rounded-full bg-[#087E83] text-white text-xs font-extrabold flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>تقييم الطلب</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {reviewingOrder && (
        <div className="fixed inset-0 z-50 bg-[#18343B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-xl border border-[#E5EAED]"
          >
            <h3 className="text-base font-extrabold text-[#18343B]">
              تقييم المتجر: {reviewingOrder.store_name_snapshot}
            </h3>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingVal(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingVal
                        ? 'text-[#F3C95B] fill-[#F3C95B]'
                        : 'text-[#E5EAED]'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={commentVal}
              onChange={(e) => setCommentVal(e.target.value)}
              placeholder="اكتب تعليقك..."
              className="w-full p-3 rounded-2xl border border-[#E5EAED] text-xs focus:outline-none focus:border-[#087E83]"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 h-10 rounded-full bg-[#087E83] text-white text-xs font-extrabold"
              >
                إرسال التقييم
              </button>
              <button
                type="button"
                onClick={() => setReviewingOrder(null)}
                className="px-4 h-10 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#74838A] text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
