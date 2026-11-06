import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  Coffee,
  Printer,
  BookOpen,
  Shirt,
  Laptop,
  Utensils,
  Sparkles,
  X,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Store } from '../types/database';

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const { stores, categories, getStoreRatingStats } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [onlyOpenStores, setOnlyOpenStores] = useState(false);

  // Store filter pills matching Reference Screen 2 (الكل | ملابس | مأكولات | قرطاسية | خدمات)
  const filterCategories = useMemo(() => {
    const active = categories
      .filter((c) => c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
    return active;
  }, [categories]);

  // Strictly display approved & active stores without duplicates
  const filteredStores = useMemo(() => {
    const seenIds = new Set<string>();
    const list: Store[] = [];

    for (const store of stores) {
      if (store.status !== 'active') continue;
      if (seenIds.has(store.id)) continue;
      seenIds.add(store.id);

      if (onlyOpenStores && !store.is_open) continue;

      if (
        selectedCategoryId !== 'cat-all' &&
        store.category_id !== selectedCategoryId
      ) {
        continue;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const catObj = categories.find((c) => c.id === store.category_id);
        const matchesNameEn = store.name_en.toLowerCase().includes(q);
        const matchesNameAr = store.name_ar.toLowerCase().includes(q);
        const matchesActivity = store.activity_type_ar.toLowerCase().includes(q);
        const matchesCat = catObj?.name_ar.toLowerCase().includes(q) || false;
        if (!matchesNameEn && !matchesNameAr && !matchesActivity && !matchesCat) {
          continue;
        }
      }

      list.push(store);
    }

    return list;
  }, [stores, selectedCategoryId, searchQuery, onlyOpenStores, categories]);

  const renderStoreEmblemIcon = (iconType: Store['icon_type']) => {
    switch (iconType) {
      case 'coffee':
        return <Coffee className="w-6 h-6 text-white stroke-[1.9]" />;
      case 'printer':
        return <Printer className="w-6 h-6 text-white stroke-[1.9]" />;
      case 'book':
        return <BookOpen className="w-6 h-6 text-white stroke-[1.9]" />;
      case 'hoodie':
        return <Shirt className="w-6 h-6 text-white stroke-[1.9]" />;
      case 'laptop':
        return <Laptop className="w-6 h-6 text-white stroke-[1.9]" />;
      case 'utensils':
        return <Utensils className="w-6 h-6 text-white stroke-[1.9]" />;
      default:
        return <Sparkles className="w-6 h-6 text-white stroke-[1.9]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] pb-24">
      {/* 1. CENTERED HEADER: المتاجر (Matches Reference Screen 2) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-header">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-center relative">
          <h1 className="text-[19px] font-extrabold text-slate-900">المتاجر</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-3.5 space-y-3.5">
        {/* 2. SEARCH BAR: ابحث عن متجر... */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن متجر..."
            className="w-full h-11 pr-11 pl-9 rounded-full bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 shadow-sm transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3. HORIZONTAL CATEGORIES FILTER PILLS + FILTER ICON BUTTON */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {filterCategories.map((cat) => {
            const active = selectedCategoryId === cat.id;
            const shortName =
              cat.name_ar === 'مأكولات ومشروبات' ? 'مأكولات' : cat.name_ar;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:border-brand-300'
                }`}
              >
                {shortName}
              </button>
            );
          })}

          {/* Filter toggle button matching the sliders icon pill in Reference Screen 2 */}
          <button
            type="button"
            onClick={() => setOnlyOpenStores((prev) => !prev)}
            title="تصفية المتاجر المفتوحة الآن"
            className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold shrink-0 transition ${
              onlyOpenStores
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200/80 text-slate-600 hover:border-brand-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">
              {onlyOpenStores ? 'المفتوحة فقط' : 'فلترة'}
            </span>
          </button>
        </div>

        {/* 4. STORE CARDS LIST (Matches Reference Screen 2 Layout & Proportions) */}
        {filteredStores.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-card space-y-2">
            <p className="text-sm font-bold text-slate-700">
              لا توجد متاجر مطابقة لخيارات البحث الحالية
            </p>
            <p className="text-xs text-slate-400">
              جرب البحث باسم آخر أو اختيار قسم &ldquo;الكل&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId('cat-all');
                setSearchQuery('');
                setOnlyOpenStores(false);
              }}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              إعادة ضبط الفلترة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredStores.map((store) => {
              const ratingStats = getStoreRatingStats(store.id);
              return (
                <div
                  key={store.id}
                  onClick={() => navigate(`/store/${store.id}`)}
                  className="group bg-white rounded-2xl p-3 border border-slate-100 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  {/* Right Side in RTL: Circular Store Emblem + Store Name + Activity + Rating */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Circular Colored Emblem Icon */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: store.icon_bg_color }}
                    >
                      {renderStoreEmblemIcon(store.icon_type)}
                    </div>

                    {/* Text Stack */}
                    <div className="flex flex-col text-right min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2
                          dir="ltr"
                          className="font-en text-[15px] font-extrabold text-slate-900 truncate"
                        >
                          {store.name_en}
                        </h2>
                        {store.working_hours && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              store.is_open
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {store.is_open ? 'مفتوح' : 'مغلق'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                        {store.activity_type_ar}
                      </p>

                      {/* Rating Row */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        {ratingStats.count > 0 ? (
                          <div className="flex items-baseline gap-1 text-xs">
                            <span className="font-en font-extrabold text-slate-800">
                              {ratingStats.average.toFixed(1)}
                            </span>
                            <span className="font-en text-[11px] text-slate-400">
                              ({ratingStats.count})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">جديد</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Left Side in RTL: Store Photo Thumbnail + Chevron Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                      <img
                        src={store.logo_url}
                        alt={store.name_en}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
