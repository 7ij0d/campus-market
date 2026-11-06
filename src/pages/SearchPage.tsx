import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  Clock,
  Store as StoreIcon,
  ShoppingBag,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/ProductCard';

const RECENT_SEARCHES_KEY = 'cm_recent_searches_v2';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { categories, locations, stores, products } = useMarketplace();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [contentType, setContentType] = useState<'all' | 'products' | 'stores' | 'services'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Real user recent searches only — never pre-populated with fake words!
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const saveRecentSearch = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    setRecentSearches((prev) => {
      const next = [cleaned, ...prev.filter((t) => t !== cleaned)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setSearchParams({ q: query.trim() });
    }
  };

  // Filtered stores & products from real database
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const activeStores = stores.filter((s) => s.status === 'active');
    const activeStoreSet = new Set(activeStores.map((s) => s.id));

    const matchedStores =
      contentType === 'products'
        ? []
        : activeStores.filter((st) => {
            if (selectedCategoryId !== 'cat-all' && st.category_id !== selectedCategoryId) {
              return false;
            }
            if (onlyAvailable && !st.is_open) return false;
            if (!q) return true;
            return (
              st.name_ar.toLowerCase().includes(q) ||
              st.name_en.toLowerCase().includes(q) ||
              st.activity_type_ar.toLowerCase().includes(q) ||
              st.description_ar.toLowerCase().includes(q)
            );
          });

    const matchedProducts =
      contentType === 'stores'
        ? []
        : products.filter((p) => {
            if (!p.is_active || !activeStoreSet.has(p.store_id)) return false;
            if (onlyAvailable && (!p.is_available_for_sale || p.stock_quantity <= 0)) {
              return false;
            }
            if (contentType === 'services' && p.category_id !== 'cat-services') {
              return false;
            }
            if (selectedCategoryId !== 'cat-all' && p.category_id !== selectedCategoryId) {
              return false;
            }
            if (maxPrice && Number(maxPrice) > 0 && p.price_lyd > Number(maxPrice)) {
              return false;
            }
            if (!q) return true;
            return (
              p.name_ar.toLowerCase().includes(q) ||
              (p.name_en && p.name_en.toLowerCase().includes(q)) ||
              p.description_ar.toLowerCase().includes(q)
            );
          });

    return {
      matchedStores,
      matchedProducts,
      totalCount: matchedStores.length + matchedProducts.length,
    };
  }, [
    query,
    stores,
    products,
    selectedCategoryId,
    contentType,
    onlyAvailable,
    maxPrice,
  ]);

  const resetFilters = () => {
    setQuery('');
    setSelectedCategoryId('cat-all');
    setSelectedLocationId('all');
    setContentType('all');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAED] shadow-header">
        <div className="px-4 h-14 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5EAED] flex items-center justify-center text-[#18343B]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <h1 className="text-base font-extrabold text-[#18343B]">البحث المتقدم</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="px-4 lg:px-0 pt-2 lg:pt-0 space-y-4">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#74838A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن متجر أو منتج أو خدمة..."
            className="w-full h-12 pr-11 pl-10 rounded-2xl bg-white border border-[#E5EAED] text-xs sm:text-sm font-medium text-[#18343B] placeholder:text-[#74838A] focus:outline-none focus:border-[#087E83] shadow-card transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74838A] hover:text-[#18343B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Filters Panel */}
        <section className="bg-white rounded-3xl p-4 border border-[#E5EAED] shadow-card space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#18343B]">
              <SlidersHorizontal className="w-4 h-4 text-[#087E83]" />
              <span>خيارات التصفية والفلترة</span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-[#087E83] hover:underline"
            >
              إعادة ضبط
            </button>
          </div>

          {/* Categories Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories
              .filter((c) => c.is_active)
              .map((cat) => {
                const active = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`h-8 px-3.5 rounded-full text-xs font-extrabold whitespace-nowrap transition shrink-0 ${
                      active
                        ? 'bg-[#087E83] text-white'
                        : 'bg-[#F8FAFC] text-[#18343B] border border-[#E5EAED]'
                    }`}
                  >
                    {cat.name_ar}
                  </button>
                );
              })}
          </div>

          {/* Secondary Filter Controls: Content Type, Faculty Location, Max Price, Availability */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-[#E5EAED] bg-[#F8FAFC] text-xs font-bold text-[#18343B] focus:outline-none focus:border-[#087E83]"
            >
              <option value="all">الكل (منتجات ومتاجر وخدمات)</option>
              <option value="products">المنتجات فقط</option>
              <option value="services">الخدمات فقط</option>
              <option value="stores">المتاجر فقط</option>
            </select>

            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#E5EAED] bg-[#F8FAFC] text-xs font-bold text-[#18343B] focus:outline-none focus:border-[#087E83]"
            >
              <option value="all">جميع الكليات</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name_ar}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="الحد الأعلى للسعر (د.ل)"
              className="h-9 px-3 rounded-xl border border-[#E5EAED] bg-[#F8FAFC] text-xs font-bold text-[#18343B] placeholder:text-[#74838A] focus:outline-none focus:border-[#087E83]"
            />

            <label className="h-9 px-3 rounded-xl border border-[#E5EAED] bg-[#F8FAFC] flex items-center justify-between text-xs font-bold text-[#18343B] cursor-pointer">
              <span>المتوفر حالياً فقط</span>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="accent-[#087E83] w-4 h-4 rounded"
              />
            </label>
          </div>
        </section>

        {/* Recent Searches (Only shown if real previous searches exist!) */}
        {recentSearches.length > 0 && (
          <section className="bg-white rounded-2xl p-4 border border-[#E5EAED] shadow-card space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#18343B]">
                <Clock className="w-3.5 h-3.5 text-[#087E83]" />
                <span>عمليات البحث السابقة</span>
              </div>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-[11px] font-bold text-[#74838A] hover:text-[#18343B]"
              >
                مسح السجل
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-full bg-[#F0F7F7] hover:bg-[#E3EFEF] text-[#087E83] text-xs font-bold transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search Results or Clean Empty State */}
        {filteredResults.totalCount === 0 ? (
          <div className="bg-white rounded-3xl py-14 px-6 text-center border border-[#E5EAED] shadow-card space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F0F7F7] border border-[#C5E0E1] flex items-center justify-center text-[#087E83] mx-auto">
              <Search className="w-7 h-7 stroke-[1.7]" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#18343B]">
              لا توجد نتائج مطابقة لبحثك
            </h2>
            <p className="text-xs text-[#74838A] max-w-sm mx-auto">
              يمكنك تعديل كلمات البحث أو تغيير الفلاتر المختارة للعثور على ما تبحث عنه.
            </p>
            {(query || selectedCategoryId !== 'cat-all' || maxPrice) && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 h-10 px-5 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold transition"
              >
                تعديل البحث وإعادة الضبط
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredResults.matchedStores.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B] flex items-center gap-1.5">
                  <StoreIcon className="w-4 h-4 text-[#087E83]" />
                  <span>المتاجر ({filteredResults.matchedStores.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredResults.matchedStores.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => navigate(`/store/${st.id}`)}
                      className="bg-white p-3.5 rounded-2xl border border-[#E5EAED] shadow-card flex items-center justify-between cursor-pointer hover:border-[#087E83] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={st.logo_url}
                          alt={st.name_ar || st.name_en}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[#18343B] truncate">
                            {st.name_ar || st.name_en}
                          </p>
                          <p className="text-[11px] text-[#74838A] truncate">
                            {st.activity_type_ar}
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-[#74838A]" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredResults.matchedProducts.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-extrabold text-[#18343B] flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#087E83]" />
                  <span>المنتجات والخدمات ({filteredResults.matchedProducts.length})</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {filteredResults.matchedProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} showStoreName />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
