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
  ArrowLeft,
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
        storeName: store.name_ar || store.name_en,
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
      <div className="px-4 pt-6">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-[#E5EAED] shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-lg font-extrabold text-[#18343B]">
            تم تأكيد طلبك بنجاح!
          </h1>
          <p className="text-xs text-[#74838A] leading-relaxed">
            تم إرسال طلبك إلى المتجر بنجاح. يمكنك متابعة حالة الطلب من صفحة
            &ldquo;طلباتي&rdquo;.
          </p>

          <div className="space-y-2 text-right bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E5EAED]">
            {confirmedOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between text-xs py-1 border-b border-[#E5EAED] last:border-none"
              >
                <div>
                  <span className="font-bold text-[#18343B]">
                    {ord.store_name_snapshot}
                  </span>
                  <span className="font-en text-[#087E83] font-extrabold mr-2">
                    #{ord.order_number}
                  </span>
                </div>
                <span className="font-extrabold text-[#18343B]">
                  {ord.total_lyd} د.ل
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 h-11 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold transition"
            >
              عرض طلباتي
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 h-11 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-[#18343B] text-xs font-extrabold transition"
            >
              تصفح المنتجات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-extrabold text-[#18343B]">السلة</h1>
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 space-y-4">
        {groupedByStore.length === 0 ? (
          /* PROFESSIONAL EMPTY CART STATE (Matches Section 10 of Master Prompt) */
          <div className="bg-white rounded-3xl py-16 px-6 text-center border border-[#E5EAED] shadow-card max-w-xl mx-auto my-4 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F7F7] border border-[#C5E0E1] text-[#087E83] flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8 stroke-[1.7]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#18343B]">سلتك فارغة</h2>
            <p className="text-xs sm:text-sm text-[#74838A] max-w-xs mx-auto">
              ابدأ بإضافة المنتجات التي تحتاجها.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/stores')}
                className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-xs transition active:scale-95"
              >
                <span>تصفح المنتجات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              {groupedByStore.map((group) => {
                const chosenFulfillment =
                  fulfillmentByStore[group.storeId] ||
                  (group.supportsDelivery ? 'campus_delivery' : 'pickup');

                return (
                  <section
                    key={group.storeId}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5EAED] shadow-card space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/store/${group.storeId}`)}
                        className="flex items-center gap-2 text-[#087E83] hover:underline"
                      >
                        <StoreIcon className="w-4 h-4" />
                        <span className="font-extrabold text-sm">
                          {group.storeName}
                        </span>
                      </button>
                      <span className="text-xs font-bold text-[#74838A]">
                        {group.items.length} عناصر
                      </span>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div
                          key={item.cartItem.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED]"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white border border-[#E5EAED]"
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <h3 className="text-xs sm:text-sm font-extrabold text-[#18343B] truncate">
                                {item.productName}
                              </h3>

                              {Object.keys(item.cartItem.selected_options).length >
                                0 && (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(
                                    item.cartItem.selected_options
                                  ).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-[#E5EAED] text-[#74838A]"
                                    >
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-extrabold text-[#087E83]">
                                  {item.unitPrice} د.ل
                                </span>
                                {item.oldUnitPrice && (
                                  <span className="text-[10px] text-[#74838A] line-through">
                                    {item.oldUnitPrice} د.ل
                                  </span>
                                )}
                              </div>

                              {item.stockExceeded && (
                                <p className="text-[10px] font-bold text-[#18343B] bg-[#FDF8E7] px-2 py-0.5 rounded inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-[#F3C95B]" />
                                  المتوفر حالياً: {item.maxStock} فقط
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.cartItem.id)}
                              className="text-[#74838A] hover:text-[#18343B] p-1"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center bg-white border border-[#E5EAED] rounded-xl p-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartItemQuantity(
                                    item.cartItem.id,
                                    item.cartItem.quantity - 1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-[#18343B] hover:text-[#087E83]"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center font-en text-xs font-extrabold text-[#18343B]">
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
                                className="w-7 h-7 flex items-center justify-center text-[#18343B] hover:text-[#087E83]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#E5EAED] space-y-2.5">
                      <label className="block text-xs font-extrabold text-[#18343B]">
                        طريقة الاستلام من {group.storeName}:
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {group.supportsDelivery && (
                          <button
                            type="button"
                            onClick={() =>
                              setFulfillmentByStore((prev) => ({
                                ...prev,
                                [group.storeId]: 'campus_delivery',
                              }))
                            }
                            className={`p-3 rounded-2xl border text-right flex items-center justify-between transition ${
                              chosenFulfillment === 'campus_delivery'
                                ? 'border-[#087E83] bg-[#F0F7F7] text-[#18343B]'
                                : 'border-[#E5EAED] text-[#74838A]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-[#087E83] shrink-0" />
                              <span className="text-xs font-bold">
                                توصيل داخل الكلية
                              </span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#087E83]">
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
                            className={`p-3 rounded-2xl border text-right flex items-center justify-between transition ${
                              chosenFulfillment === 'pickup'
                                ? 'border-[#087E83] bg-[#F0F7F7] text-[#18343B]'
                                : 'border-[#E5EAED] text-[#74838A]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <StoreIcon className="w-4 h-4 text-[#087E83] shrink-0" />
                              <span className="text-xs font-bold">
                                استلام من المتجر
                              </span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#087E83]">
                              مجاني
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <MessageSquare className="w-3.5 h-3.5 text-[#74838A] absolute right-3.5 top-3" />
                        <input
                          type="text"
                          value={notesByStore[group.storeId] || ''}
                          onChange={(e) =>
                            setNotesByStore((prev) => ({
                              ...prev,
                              [group.storeId]: e.target.value,
                            }))
                          }
                          placeholder={`ملاحظة للمتجر (اختياري)...`}
                          className="w-full h-10 pr-9 pl-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAED] text-xs text-[#18343B] focus:outline-none focus:border-[#087E83]"
                        />
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="space-y-4">
              <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5EAED] shadow-card space-y-3">
                <div className="flex items-center gap-1.5 text-[#087E83]">
                  <MapPin className="w-4 h-4" />
                  <h2 className="text-xs font-extrabold text-[#18343B]">
                    موقع الاستلام داخل الكلية
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
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-bold text-[#18343B] bg-[#F8FAFC]"
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
                    className="w-full h-10 px-3 rounded-xl border border-[#E5EAED] text-xs font-semibold text-[#18343B] bg-white"
                  >
                    {currentLocation.pickup_points.map((pt) => (
                      <option key={pt} value={pt}>
                        نقطة الاستلام: {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5EAED] shadow-card space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B] border-b border-[#E5EAED] pb-2.5">
                  ملخص السلة
                </h2>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#74838A]">
                    <span>إجمالي المنتجات</span>
                    <span className="font-bold text-[#18343B]">
                      {summaryTotals.subtotal} د.ل
                    </span>
                  </div>

                  {summaryTotals.discountTotal > 0 && (
                    <div className="flex items-center justify-between text-[#087E83] font-bold">
                      <span>الخصومات</span>
                      <span>-{summaryTotals.discountTotal} د.ل</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[#74838A]">
                    <span>رسوم التوصيل</span>
                    <span className="font-bold text-[#18343B]">
                      {summaryTotals.deliveryTotal > 0
                        ? `${summaryTotals.deliveryTotal} د.ل`
                        : 'مجاني'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-extrabold text-[#18343B] border-t border-[#E5EAED] pt-2.5">
                    <span>الإجمالي الكلي</span>
                    <span className="text-[#087E83] text-base">
                      {summaryTotals.grandTotal} د.ل
                    </span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="p-2.5 rounded-xl bg-[#FDF8E7] border border-[#F3C95B] text-[#18343B] text-xs font-bold">
                    {checkoutError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={summaryTotals.hasStockError}
                  onClick={handleConfirmOrder}
                  className={`w-full h-11 rounded-full font-extrabold text-xs sm:text-sm transition shadow-sm ${
                    summaryTotals.hasStockError
                      ? 'bg-[#E5EAED] text-[#74838A] cursor-not-allowed'
                      : 'bg-[#087E83] hover:bg-[#06666A] text-white active:scale-98'
                  }`}
                >
                  تأكيد الطلب ({summaryTotals.grandTotal} د.ل)
                </button>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
