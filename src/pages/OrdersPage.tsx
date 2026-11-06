import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
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
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Order, OrderStatus } from '../types/database';

export const STATUS_META: Record<
  OrderStatus,
  { label: string; colorClass: string; badgeBg: string }
> = {
  pending_review: {
    label: 'قيد المراجعة',
    colorClass: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-200',
  },
  accepted: {
    label: 'مقبول',
    colorClass: 'text-blue-700',
    badgeBg: 'bg-blue-50 border-blue-200',
  },
  preparing: {
    label: 'قيد التجهيز',
    colorClass: 'text-brand-700',
    badgeBg: 'bg-brand-50 border-brand-200',
  },
  ready_for_pickup: {
    label: 'جاهز للاستلام',
    colorClass: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 border-indigo-200',
  },
  out_for_delivery: {
    label: 'خرج للتوصيل',
    colorClass: 'text-purple-700',
    badgeBg: 'bg-purple-50 border-purple-200',
  },
  completed: {
    label: 'مكتمل',
    colorClass: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-200',
  },
  rejected: {
    label: 'مرفوض',
    colorClass: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-200',
  },
  cancelled: {
    label: 'ملغي',
    colorClass: 'text-slate-600',
    badgeBg: 'bg-slate-100 border-slate-200',
  },
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    orders,
    reviews,
    updateOrderStatus,
    submitReview,
  } = useMarketplace();

  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>('ord-1005');

  // Review Modal state
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState('');

  // Strictly show only orders belonging to currentUser
  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders
      .filter((o) => o.customer_id === currentUser.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [currentUser, orders]);

  const activeOrders = useMemo(
    () =>
      myOrders.filter((o) =>
        [
          'pending_review',
          'accepted',
          'preparing',
          'ready_for_pickup',
          'out_for_delivery',
        ].includes(o.status)
      ),
    [myOrders]
  );

  const pastOrders = useMemo(
    () =>
      myOrders.filter((o) =>
        ['completed', 'rejected', 'cancelled'].includes(o.status)
      ),
    [myOrders]
  );

  const displayedOrders = tab === 'active' ? activeOrders : pastOrders;

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Package className="w-10 h-10 text-brand-600" />
        <h2 className="text-base font-extrabold text-slate-800">
          يرجى تسجيل الدخول لعرض طلباتك
        </h2>
        <button
          type="button"
          onClick={() => navigate('/account')}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-24">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-header">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-extrabold text-slate-900">طلباتي</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Tabs: Active vs Past Orders */}
        <div className="grid grid-cols-2 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
              tab === 'active'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الطلبات الحالية ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
              tab === 'history'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الطلبات السابقة ({pastOrders.length})
          </button>
        </div>

        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-card space-y-2.5">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-extrabold text-slate-700">
              {tab === 'active'
                ? 'لا توجد طلبات جارية حالياً'
                : 'لا توجد طلبات سابقة في سجلك'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/stores')}
              className="mt-2 inline-flex px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              تصفح المتاجر
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {displayedOrders.map((order) => {
              const meta = STATUS_META[order.status];
              const isExpanded = expandedOrderId === order.id;
              const hasReviewed = reviews.some(
                (r) => r.order_id === order.id && r.user_id === currentUser.id
              );

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
                >
                  {/* Order Card Header */}
                  <div
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : order.id)
                    }
                    className="p-4 cursor-pointer hover:bg-slate-50/50 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          dir="ltr"
                          className="font-en text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg"
                        >
                          #{order.order_number}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/store/${order.store_id}`);
                          }}
                          className="font-en text-sm font-extrabold text-slate-900 hover:text-brand-600 flex items-center gap-1"
                        >
                          <StoreIcon className="w-3.5 h-3.5 text-brand-600" />
                          {order.store_name_snapshot}
                        </button>
                      </div>

                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${meta.badgeBg} ${meta.colorClass}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleString('ar-LY', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {order.fulfillment_method === 'campus_delivery'
                            ? 'توصيل داخل الكلية'
                            : 'استلام من المتجر'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900">
                          {order.total_lyd} د.ل
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details & Status Audit Log */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4">
                      {/* Snapshot Items */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-extrabold text-slate-700">
                          المنتجات المطلوبة:
                        </h3>
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.product_image_snapshot}
                                alt={item.product_name_snapshot}
                                className="w-11 h-11 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-extrabold text-slate-800">
                                  {item.product_name_snapshot}{' '}
                                  <span className="text-brand-600">
                                    × {item.quantity}
                                  </span>
                                </p>
                                {Object.keys(item.selected_options_snapshot)
                                  .length > 0 && (
                                  <p className="text-[10px] text-slate-500">
                                    {Object.entries(
                                      item.selected_options_snapshot
                                    )
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(' | ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-extrabold text-slate-900">
                              {item.line_total_lyd} د.ل
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Location & Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            نقطة الاستلام / التوصيل:
                          </span>
                          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-600" />
                            {order.campus_location_ar} —{' '}
                            {order.pickup_point_ar || 'مقر المتجر'}
                          </span>
                        </div>

                        {order.customer_note && (
                          <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-bold block">
                              ملاحظاتك للمتجر:
                            </span>
                            <span className="font-semibold text-slate-700 mt-0.5 block">
                              {order.customer_note}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status History Timeline */}
                      <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                          <History className="w-3.5 h-3.5 text-brand-600" />
                          <span>سجل تحديثات حالة الطلب:</span>
                        </div>
                        <div className="space-y-2 pr-2 border-r-2 border-brand-200">
                          {order.status_history.map((h) => (
                            <div
                              key={h.id}
                              className="text-[11px] flex items-start justify-between gap-2"
                            >
                              <div>
                                <span className="font-extrabold text-slate-800">
                                  {STATUS_META[h.status]?.label || h.status}
                                </span>{' '}
                                <span className="text-slate-500">
                                  — بواسطة: {h.actor_name_ar}
                                </span>
                                {h.note && (
                                  <p className="text-slate-600 mt-0.5">
                                    {h.note}
                                  </p>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(h.created_at).toLocaleTimeString(
                                  'ar-LY',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Actions: Cancel if Pending, or Rate if Completed */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {order.status === 'pending_review' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                'cancelled',
                                'تم إلغاء الطلب من قبل الطالب قبل البدء بالتجهيز'
                              )
                            }
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold transition"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>إلغاء الطلب</span>
                          </button>
                        )}

                        {order.status === 'completed' && !hasReviewed && (
                          <button
                            type="button"
                            onClick={() => setReviewingOrder(order)}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-xs transition"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>تقييم المتجر والمنتجات</span>
                          </button>
                        )}

                        {order.status === 'completed' && hasReviewed && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            تم تقييم هذا الطلب
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* VERIFIED ORDER REVIEW MODAL */}
      {reviewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-extrabold text-slate-900">
              تقييم تجربتك مع {reviewingOrder.store_name_snapshot}
            </h3>
            <p className="text-xs text-slate-500">
              طلب رقم #{reviewingOrder.order_number}
            </p>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingVal(star)}
                  className="p-1 transition hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingVal
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={commentVal}
              onChange={(e) => setCommentVal(e.target.value)}
              placeholder="اكتب رأيك حول جودة المنتج وسرعة التجهيز..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-brand-600 text-white text-xs font-extrabold"
              >
                إرسال التقييم
              </button>
              <button
                type="button"
                onClick={() => setReviewingOrder(null)}
                className="px-4 h-10 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
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
