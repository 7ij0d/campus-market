import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Store as StoreIcon,
  MapPin,
  Truck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CartItem, Order } from '../types/database';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    cartItems,
    products,
    stores,
    locations,
    selectedLocationId,
    selectedPickupPoint,
    setSelectedLocationId,
    setSelectedPickupPoint,
    updateCartItemQuantity,
    removeFromCart,
    placeOrdersFromCart,
  } = useMarketplace();

  const [fulfillmentByStore, setFulfillmentByStore] = useState<
    Record<string, 'pickup' | 'campus_delivery'>
  >({});
  const [notesByStore, setNotesByStore] = useState<Record<string, string>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[] | null>(null);

  const currentLocation =
    locations.find((l) => l.id === selectedLocationId) || locations[0];

  // Group cart items by store_id
  const groupedByStore = useMemo(() => {
    const map = new Map<
      string,
      {
        storeId: string;
        storeName: string;
        supportsPickup: boolean;
        supportsDelivery: boolean;
        deliveryFee: number;
        items: Array<{
          cartItem: CartItem;
          unitPrice: number;
          oldUnitPrice?: number;
          lineTotal: number;
          productName: string;
          productImage: string;
          maxStock: number;
          stockExceeded: boolean;
        }>;
      }
    >();

    for (const ci of cartItems) {
      const prod = products.find((p) => p.id === ci.product_id);
      const store = stores.find((s) => s.id === ci.store_id);
      if (!prod || !store) continue;

      let modifier = 0;
      for (const vg of prod.variant_groups) {
        const optId = ci.selected_option_ids[vg.id];
        const opt = vg.options.find((o) => o.id === optId);
        if (opt) modifier += opt.price_modifier_lyd;
      }

      const unitPrice = prod.price_lyd + modifier;
      const oldUnitPrice = prod.old_price_lyd
        ? prod.old_price_lyd + modifier
        : undefined;
      const lineTotal = unitPrice * ci.quantity;

      const group = map.get(store.id) || {
        storeId: store.id,
        storeName: store.name_en,
        supportsPickup: store.supports_pickup,
        supportsDelivery: store.supports_delivery,
        deliveryFee: store.delivery_fee_lyd,
        items: [],
      };

      group.items.push({
        cartItem: ci,
        unitPrice,
        oldUnitPrice,
        lineTotal,
        productName: prod.name_ar,
        productImage: prod.images[0],
        maxStock: prod.stock_quantity,
        stockExceeded: ci.quantity > prod.stock_quantity,
      });

      map.set(store.id, group);
    }

    return Array.from(map.values());
  }, [cartItems, products, stores]);

  // Calculate financial totals
  const summaryTotals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let deliveryTotal = 0;
    let hasStockError = false;

    for (const group of groupedByStore) {
      const method =
        fulfillmentByStore[group.storeId] ||
        (group.supportsDelivery ? 'campus_delivery' : 'pickup');
      if (method === 'campus_delivery') {
        deliveryTotal += group.deliveryFee;
      }

      for (const item of group.items) {
        subtotal += item.lineTotal;
        if (item.oldUnitPrice && item.oldUnitPrice > item.unitPrice) {
          discountTotal +=
            (item.oldUnitPrice - item.unitPrice) * item.cartItem.quantity;
        }
        if (item.stockExceeded) {
          hasStockError = true;
        }
      }
    }

    return {
      subtotal,
      discountTotal,
      deliveryTotal,
      grandTotal: subtotal + deliveryTotal,
      hasStockError,
    };
  }, [groupedByStore, fulfillmentByStore]);

  const handleConfirmOrder = () => {
    setCheckoutError(null);
    if (!currentUser) {
      navigate('/account');
      return;
    }

    const effectiveFulfillment: Record<string, 'pickup' | 'campus_delivery'> = {};
    for (const group of groupedByStore) {
      effectiveFulfillment[group.storeId] =
        fulfillmentByStore[group.storeId] ||
        (group.supportsDelivery ? 'campus_delivery' : 'pickup');
    }

    const res = placeOrdersFromCart({
      fulfillmentByStore: effectiveFulfillment,
      notesByStore,
      campusLocationAr: currentLocation.name_ar,
      pickupPointAr: selectedPickupPoint,
    });

    if (!res.success) {
      setCheckoutError(res.error || 'حدث خطأ أثناء تأكيد الطلب');
      return;
    }

    if (res.createdOrders) {
      setConfirmedOrders(res.createdOrders);
    }
  };

  if (confirmedOrders) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] pb-24 px-4 pt-8">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-slate-100 shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-900">
            تم تأكيد طلبك بنجاح!
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            تم إرسال طلبك إلى المتجر وإصدار إشعار فوري. يمكنك متابعة حالة تجهيز
            الطلب لحظة بلحظة من صفحة &ldquo;طلباتي&rdquo;.
          </p>

          <div className="space-y-2 text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {confirmedOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-none"
              >
                <div>
                  <span className="font-bold text-slate-800">
                    متجر {ord.store_name_snapshot}
                  </span>
                  <span className="font-en text-brand-600 font-extrabold mr-2">
                    #{ord.order_number}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {ord.total_lyd} د.ل
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition"
            >
              الانتقال إلى طلباتي
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition"
            >
              متابعة التسوق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-28">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-header">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-extrabold text-slate-900">
            سلة التسوق ({cartItems.reduce((s, i) => s + i.quantity, 0)})
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {groupedByStore.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-card space-y-3">
            <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h2 className="text-base font-extrabold text-slate-800">
              سلة التسوق فارغة حالياً
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              استكشف المتاجر الجامعية وأضف منتجاتك المفضلة أو قهوتك الصباحية إلى السلة.
            </p>
            <button
              type="button"
              onClick={() => navigate('/stores')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-extrabold shadow-xs"
            >
              <span>تصفح المتاجر الآن</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Right/Main Column: Store Groups */}
            <div className="lg:col-span-2 space-y-4">
              {groupedByStore.map((group) => {
                const chosenFulfillment =
                  fulfillmentByStore[group.storeId] ||
                  (group.supportsDelivery ? 'campus_delivery' : 'pickup');

                return (
                  <section
                    key={group.storeId}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3.5"
                  >
                    {/* Store Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/store/${group.storeId}`)}
                        className="flex items-center gap-2 text-brand-700 hover:underline"
                      >
                        <StoreIcon className="w-4 h-4" />
                        <span className="font-en font-extrabold text-sm">
                          {group.storeName}
                        </span>
                      </button>
                      <span className="text-[11px] font-bold text-slate-400">
                        {group.items.length} منتجات
                      </span>
                    </div>

                    {/* Items in this Store */}
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div
                          key={item.cartItem.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white"
                            />
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <h3 className="text-xs font-extrabold text-slate-800 truncate">
                                {item.productName}
                              </h3>

                              {Object.keys(item.cartItem.selected_options).length >
                                0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {Object.entries(
                                    item.cartItem.selected_options
                                  ).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600"
                                    >
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-baseline gap-1.5 pt-1">
                                <span className="text-xs font-extrabold text-brand-700">
                                  {item.unitPrice} د.ل
                                </span>
                                {item.oldUnitPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {item.oldUnitPrice} د.ل
                                  </span>
                                )}
                              </div>

                              {item.stockExceeded && (
                                <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  المتوفر حالياً: {item.maxStock} فقط
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls + Delete */}
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.cartItem.id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.cartItem.id,
                                    item.cartItem.quantity - 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-brand-600"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center font-en text-xs font-extrabold text-slate-800">
                                {item.cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.cartItem.id,
                                    item.cartItem.quantity + 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-brand-600"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Store Fulfillment Method Selector (Pickup vs Campus Delivery) */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <label className="block text-xs font-extrabold text-slate-700">
                        طريقة استلام الطلب من {group.storeName}:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {group.supportsDelivery && (
                          <button
                            type="button"
                            onClick={() =>
                              setFulfillmentByStore((prev) => ({
                                ...prev,
                                [group.storeId]: 'campus_delivery',
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition ${
                              chosenFulfillment === 'campus_delivery'
                                ? 'border-brand-600 bg-brand-50/70 text-brand-900'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                              <span className="text-xs font-bold">
                                توصيل داخل الكلية
                              </span>
                            </div>
                            <span className="text-[11px] font-extrabold text-brand-700">
                              {group.deliveryFee > 0
                                ? `${group.deliveryFee} د.ل`
                                : 'مجاني'}
                            </span>
                          </button>
                        )}

                        {group.supportsPickup && (
                          <button
                            type="button"
                            onClick={() =>
                              setFulfillmentByStore((prev) => ({
                                ...prev,
                                [group.storeId]: 'pickup',
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition ${
                              chosenFulfillment === 'pickup'
                                ? 'border-brand-600 bg-brand-50/70 text-brand-900'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <StoreIcon className="w-4 h-4 text-brand-600 shrink-0" />
                              <span className="text-xs font-bold">
                                استلام من المتجر
                              </span>
                            </div>
                            <span className="text-[11px] font-extrabold text-emerald-700">
                              مجاني
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Note for this store */}
                      <div className="relative">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                        <input
                          type="text"
                          value={notesByStore[group.storeId] || ''}
                          onChange={(e) =>
                            setNotesByStore((prev) => ({
                              ...prev,
                              [group.storeId]: e.target.value,
                            }))
                          }
                          placeholder={`إضافة ملاحظة لمتجر ${group.storeName} (اختياري)...`}
                          className="w-full h-9 pr-8 pl-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Left Column: Campus Location & Order Summary */}
            <div className="space-y-4">
              {/* Campus Location Box */}
              <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
                <div className="flex items-center gap-1.5 text-brand-700">
                  <MapPin className="w-4 h-4" />
                  <h2 className="text-xs font-extrabold">
                    موقع الاستلام أو التوصيل داخل الكلية
                  </h2>
                </div>

                <div className="space-y-2">
                  <select
                    value={selectedLocationId}
                    onChange={(e) => {
                      const locId = e.target.value;
                      setSelectedLocationId(locId);
                      const locObj = locations.find((l) => l.id === locId);
                      if (locObj && locObj.pickup_points[0]) {
                        setSelectedPickupPoint(locObj.pickup_points[0]);
                      }
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name_ar} — {loc.campus_name_ar}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedPickupPoint}
                    onChange={(e) => setSelectedPickupPoint(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                  >
                    {currentLocation.pickup_points.map((pt) => (
                      <option key={pt} value={pt}>
                        نقطة التوصيل: {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              {/* Financial Summary Box */}
              <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  ملخص الفاتورة
                </h2>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>مجموع المنتجات</span>
                    <span className="font-bold">{summaryTotals.subtotal} د.ل</span>
                  </div>

                  {summaryTotals.discountTotal > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>إجمالي الخصومات المطبقة</span>
                      <span>-{summaryTotals.discountTotal} د.ل</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>رسوم التوصيل داخل الكلية</span>
                    <span className="font-bold">
                      {summaryTotals.deliveryTotal > 0
                        ? `${summaryTotals.deliveryTotal} د.ل`
                        : 'مجاني'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-2.5">
                    <span>الإجمالي النهائي</span>
                    <span className="text-brand-700 text-base">
                      {summaryTotals.grandTotal} د.ل
                    </span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {checkoutError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={summaryTotals.hasStockError}
                  onClick={handleConfirmOrder}
                  className={`w-full h-11 rounded-xl font-extrabold text-xs sm:text-sm transition shadow-md ${
                    summaryTotals.hasStockError
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-98'
                  }`}
                >
                  تأكيد وإرسال الطلب ({summaryTotals.grandTotal} د.ل)
                </button>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
