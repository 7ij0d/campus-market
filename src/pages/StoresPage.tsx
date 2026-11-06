import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  X,
  Plus,
  Store as StoreIcon,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Store } from '../types/database';

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const { stores, categories, getStoreRatingStats } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [onlyOpenStores, setOnlyOpenStores] = useState(false);

  const filterCategories = useMemo(
    () =>
      categories
        .filter((c) => c.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [categories]
  );

  // Strictly display real approved & active stores from database
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

  return (
    <div className="space-y-4">
      {/* Mobile Header: المتاجر */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 h-14 flex items-center justify-center relative">
          <h1 className="text-[18px] font-extrabold text-[#18343B]">المتاجر</h1>
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 space-y-4">
        {/* Desktop Page Title */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[#18343B]">المتاجر الجامعية</h1>
            <p className="text-xs text-[#74838A] mt-0.5">
              استعرض المتاجر والمشاريع الطلابية والخدمات المعتمدة داخل الكلية
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/account?tab=merchant_invite')}
            className="h-10 px-5 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>كن تاجراً في CampusMarket</span>
          </button>
        </div>

        {/* Search Bar: ابحث عن متجر... */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#74838A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن متجر..."
            className="w-full h-11 pr-11 pl-9 rounded-full bg-white border border-[#E5EAED] text-xs sm:text-sm text-[#18343B] placeholder:text-[#74838A] focus:outline-none focus:border-[#087E83] shadow-2xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74838A] hover:text-[#18343B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Filter Pills + Sliders Button (Matches Reference Image 3 Screen 2) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {filterCategories.map((cat) => {
            const active = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`h-9 px-4 rounded-full text-xs font-extrabold whitespace-nowrap transition shrink-0 ${
                  active
                    ? 'bg-[#087E83] text-white shadow-2xs'
                    : 'bg-white text-[#18343B] border border-[#E5EAED] hover:border-[#36A6A6]'
                }`}
              >
                {cat.name_ar}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setOnlyOpenStores((prev) => !prev)}
            title="تصفية المتاجر المفتوحة"
            className={`h-9 w-9 sm:w-auto sm:px-3.5 rounded-full border flex items-center justify-center gap-1.5 text-xs font-extrabold shrink-0 transition ${
              onlyOpenStores
                ? 'bg-[#EAF3F4] border-[#087E83] text-[#087E83]'
                : 'bg-white border-[#E5EAED] text-[#18343B] hover:border-[#36A6A6]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">
              {onlyOpenStores ? 'المفتوحة حالياً' : 'فلترة'}
            </span>
          </button>
        </div>

        {/* STORES LIST OR PROFESSIONAL EMPTY STATE (Matches Reference Image 3 Screen 2) */}
        {filteredStores.length === 0 ? (
          <div className="bg-white rounded-3xl py-14 px-6 text-center border border-[#E5EAED] shadow-card flex flex-col items-center justify-center max-w-xl mx-auto my-4">
            {/* Storefront Illustration matching Reference Image 3 Screen 2 */}
            <div className="w-44 h-36 mb-4 flex items-center justify-center">
              <svg
                viewBox="0 0 220 170"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Soft Aura Background */}
                <circle cx="110" cy="90" r="68" fill="#F0F7F7" />
                {/* Ground Line & Bushes */}
                <ellipse cx="52" cy="142" rx="18" ry="12" fill="#94C9CB" />
                <ellipse cx="168" cy="142" rx="18" ry="12" fill="#94C9CB" />
                <rect x="30" y="146" width="160" height="5" rx="2.5" fill="#C5E0E1" />
                {/* Store Building Body */}
                <rect
                  x="64"
                  y="72"
                  width="92"
                  height="74"
                  rx="6"
                  fill="#DCEAEB"
                  stroke="#C5E0E1"
                  strokeWidth="2"
                />
                {/* Store Door & Window */}
                <rect x="86" y="102" width="22" height="44" rx="3" fill="#94C9CB" />
                <circle cx="103" cy="124" r="2" fill="#FFFFFF" />
                <rect
                  x="116"
                  y="102"
                  width="26"
                  height="24"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#94C9CB"
                  strokeWidth="2"
                />
                {/* Striped Turquoise & White Awning */}
                <path
                  d="M56 74L66 48H154L164 74H56Z"
                  fill="#087E83"
                />
                <path d="M56 74L66 48H84L78 74H56Z" fill="#087E83" />
                <path d="M78 74L84 48H102L100 74H78Z" fill="#FFFFFF" />
                <path d="M100 74L102 48H118L120 74H100Z" fill="#087E83" />
                <path d="M120 74L118 48H136L142 74H120Z" fill="#FFFFFF" />
                <path d="M142 74L136 48H154L164 74H142Z" fill="#087E83" />
                {/* Scalloped Awning Bottom */}
                <circle cx="67" cy="74" r="11" fill="#087E83" />
                <circle cx="89" cy="74" r="11" fill="#FFFFFF" />
                <circle cx="110" cy="74" r="11" fill="#087E83" />
                <circle cx="131" cy="74" r="11" fill="#FFFFFF" />
                <circle cx="153" cy="74" r="11" fill="#087E83" />
              </svg>
            </div>

            <h2 className="text-lg font-extrabold text-[#18343B]">
              لا توجد متاجر حالياً
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#74838A] mt-1.5">
              سيتم عرض المتاجر هنا فور إضافتها
            </p>

            <button
              type="button"
              onClick={() => navigate('/account?tab=merchant_invite')}
              className="mt-6 h-11 px-7 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>كن تاجراً في CampusMarket</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store) => {
              const ratingStats = getStoreRatingStats(store.id);
              const catObj = categories.find((c) => c.id === store.category_id);
              return (
                <div
                  key={store.id}
                  onClick={() => navigate(`/store/${store.id}`)}
                  className="group bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-card hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name_ar || store.name_en}
                        className="w-16 h-16 rounded-2xl object-cover border border-[#E5EAED] shrink-0 bg-[#F8FAFC]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center shrink-0">
                        <StoreIcon className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex flex-col text-right min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-extrabold text-[#18343B] truncate">
                          {store.name_ar || store.name_en}
                        </h2>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                            store.is_open
                              ? 'bg-[#EAF3F4] text-[#087E83]'
                              : 'bg-[#F8FAFC] text-[#74838A] border border-[#E5EAED]'
                          }`}
                        >
                          {store.is_open ? 'مفتوح' : 'مغلق حالياً'}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-[#74838A] line-clamp-1 mt-0.5">
                        {store.description_ar || store.activity_type_ar}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#74838A]">
                        {catObj && (
                          <span className="bg-[#F8FAFC] border border-[#E5EAED] px-2 py-0.5 rounded-md font-bold text-[#18343B]">
                            {catObj.name_ar}
                          </span>
                        )}
                        {ratingStats.count > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#F3C95B] fill-[#F3C95B]" />
                            <span className="font-en font-extrabold text-[#18343B]">
                              {ratingStats.average.toFixed(1)}
                            </span>
                            <span>({ratingStats.count})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronLeft className="w-4 h-4 text-[#74838A] group-hover:text-[#087E83] transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
