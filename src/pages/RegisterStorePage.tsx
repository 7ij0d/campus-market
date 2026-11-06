import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store as StoreIcon,
  Upload,
  Trash2,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tag,
  ArrowRight,
  ImageIcon,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { compressImageFile } from '../utils/imageUpload';

export const RegisterStorePage: React.FC = () => {
  const navigate = useNavigate();
  const { registerMerchantByInvite } = useMarketplace();

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [activityType, setActivityType] = useState('مأكولات ومشروبات');
  const [campusLocation, setCampusLocation] = useState('');
  const [description, setDescription] = useState('');

  // Owner & Contact Fields
  const [ownerName, setOwnerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  // Image Upload States
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);

  // Validation Errors & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Handle Logo Upload (Square 1:1)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, logo: 'يرجى اختيار ملف صورة صالح (JPG أو PNG)' }));
      return;
    }

    setLogoUploading(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.logo;
      return copy;
    });

    try {
      const compressedData = await compressImageFile(file, 400, 400, 0.88);
      setLogoUrl(compressedData);
    } catch {
      setErrors((prev) => ({ ...prev, logo: 'فشل معالجة الصورة، يرجى تجربة صورة أخرى' }));
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle Banner Upload (Wide 3:1 approx 1200x400)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, cover: 'يرجى اختيار ملف صورة صالح (JPG أو PNG)' }));
      return;
    }

    setCoverUploading(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.cover;
      return copy;
    });

    try {
      const compressedData = await compressImageFile(file, 1200, 450, 0.88);
      setCoverUrl(compressedData);
    } catch {
      setErrors((prev) => ({ ...prev, cover: 'فشل معالجة البانر، يرجى تجربة صورة أخرى' }));
    } finally {
      setCoverUploading(false);
    }
  };

  // Validation Logic
  const validateForm = () => {
    const err: Record<string, string> = {};

    if (!storeName.trim()) {
      err.storeName = 'اسم المتجر مطلوب';
    }
    if (!activityType.trim()) {
      err.activityType = 'نوع النشاط مطلوب';
    }
    if (!campusLocation.trim()) {
      err.campusLocation = 'موقع المتجر داخل الكلية مطلوب';
    }
    if (!ownerName.trim()) {
      err.ownerName = 'اسم صاحب المتجر مطلوب';
    }

    // Phone validation
    const cleanedPhone = contactPhone.trim();
    if (!cleanedPhone) {
      err.contactPhone = 'رقم الهاتف مطلوب للتواصل مع المتجر';
    } else if (!/^09[1-6]\d{7}$/.test(cleanedPhone.replace(/\s+/g, '')) && cleanedPhone.length < 8) {
      err.contactPhone = 'يرجى إدخال رقم هاتف صحيح';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim()) {
      err.contactEmail = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(contactEmail.trim())) {
      err.contactEmail = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      // Scroll to top error
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = registerMerchantByInvite({
        token: inviteToken.trim() || undefined,
        full_name: ownerName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        store_name_en: storeName.trim(),
        store_name_ar: storeName.trim(),
        activity_type_ar: activityType.trim(),
        description_ar: description.trim() || activityType.trim(),
        location_inside_campus: campusLocation.trim(),
        logo_url: logoUrl,
        cover_url: coverUrl,
      });

      if (res.success) {
        setIsSubmittedSuccess(true);
        window.scrollTo({ top: 80, behavior: 'smooth' });
      } else {
        setErrors({ general: res.error || 'تعذر إرسال الطلب، يرجى المحاولة لاحقاً.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-[#E5EAED] shadow-card text-center space-y-5">
          <div className="w-18 h-18 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#18343B]">
              تم إرسال طلب إنشاء المتجر بنجاح!
            </h1>
            <p className="text-xs sm:text-sm text-[#74838A] leading-relaxed max-w-md mx-auto">
              طلبك لإنشاء متجر <strong className="text-[#087E83]">"{storeName}"</strong> تم استلامه وحفظه بنجاح، وهو الآن <span className="font-extrabold text-[#18343B]">بانتظار المراجعة والاعتماد من قبل إدارة المنصة</span>. سيظهر متجرك في الصفحة الرئيسية فور اعتماده.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] text-right space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#74838A]">
              <span>اسم المتجر:</span>
              <span className="font-extrabold text-[#18343B]">{storeName}</span>
            </div>
            <div className="flex justify-between items-center text-[#74838A]">
              <span>صاحب المتجر:</span>
              <span className="font-extrabold text-[#18343B]">{ownerName}</span>
            </div>
            <div className="flex justify-between items-center text-[#74838A]">
              <span>الحالة الحالية:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF8E7] text-[#18343B] font-extrabold border border-[#F3C95B]">
                <span className="w-2 h-2 rounded-full bg-[#F3C95B]" />
                بانتظار مراجعة الإدارة
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/merchant')}
              className="w-full sm:w-auto px-7 h-12 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-xs sm:text-sm font-extrabold shadow-sm transition active:scale-98"
            >
              الذهاب إلى لوحة تحكم المتجر
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 h-12 rounded-full bg-white hover:bg-[#F8FAFC] border border-[#E5EAED] text-[#18343B] text-xs sm:text-sm font-extrabold transition"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* 2. Top Header & Title */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5EAED] shadow-card space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3F4] text-[#087E83] flex items-center justify-center shrink-0">
              <StoreIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#18343B]">
                إنشاء متجرك في CampusMarket
              </h1>
              <p className="text-xs sm:text-sm text-[#74838A] mt-0.5">
                أضف بيانات متجرك وصوره ليتمكن الطلبة من اكتشافه والتسوق منه.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5EAED] text-xs font-bold text-[#74838A] hover:text-[#18343B] transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
        </div>

        {/* Clean Step Indicator */}
        <div className="pt-3 border-t border-[#E5EAED]/80">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-[#EAF3F4] text-[#087E83] font-extrabold">
              <span className="w-5 h-5 rounded-full bg-[#087E83] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="truncate">بيانات المتجر</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-[#EAF3F4] text-[#087E83] font-extrabold">
              <span className="w-5 h-5 rounded-full bg-[#087E83] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="truncate">صور المتجر</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-[#EAF3F4] text-[#087E83] font-extrabold">
              <span className="w-5 h-5 rounded-full bg-[#087E83] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="truncate">بيانات التواصل</span>
            </div>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 3. Section: Store Images Upload (Clean, Empty Slots, No Fake Logos/Food) */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5EAED] shadow-card space-y-4">
          <div className="border-b border-[#E5EAED] pb-3">
            <h2 className="text-base font-extrabold text-[#18343B] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#087E83]" />
              <span>صور المتجر (الصورة المصغرة والبانر)</span>
            </h2>
            <p className="text-xs text-[#74838A] mt-1">
              ارفع صوراً واضحة لمتجرك تظهر للطلاب في الصفحة الرئيسية وعند فتح صفحة المتجر.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Card A: Store Thumbnail (1:1 Ratio) */}
            <div className="md:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#18343B]">
                    صورة المتجر المصغرة (الشعار)
                  </span>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#74838A] mt-0.5">
                  بصيغة JPG أو PNG، حجم مقترح 400 × 400 (نسبة 1:1)
                </p>
              </div>

              {/* Upload Box or Preview Box */}
              <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-2xl bg-white border-2 border-dashed border-[#D5DFE3] hover:border-[#087E83] transition overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="معاينة الشعار"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-[#74838A]">
                    <div className="w-12 h-12 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
                      <StoreIcon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-xs font-bold text-[#18343B]">
                      {logoUploading ? 'جاري الرفع والضغط...' : 'مساحة الشعار'}
                    </span>
                    <span className="text-[10px] text-[#74838A]">
                      تظهر بشكل دائري في بطاقة المتجر
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <label className="w-full h-10 px-4 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>{logoUrl ? 'تغيير الصورة المصغرة' : 'رفع صورة الشعار'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {errors.logo && (
                <p className="text-[11px] font-bold text-rose-600 text-center">
                  {errors.logo}
                </p>
              )}
            </div>

            {/* Card B: Store Banner (Wide approx 3:1 Ratio) */}
            <div className="md:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAED] space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#18343B]">
                    بانر المتجر (صورة الغلاف)
                  </span>
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#74838A] mt-0.5">
                  بصيغة JPG أو PNG، حجم مقترح 1200 × 400 (نسبة 3:1)
                </p>
              </div>

              {/* Upload Box or Preview Box */}
              <div className="relative aspect-[3/1.2] w-full rounded-2xl bg-white border-2 border-dashed border-[#D5DFE3] hover:border-[#087E83] transition overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="معاينة البانر"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5 text-[#74838A]">
                    <div className="w-12 h-12 rounded-full bg-[#EAF3F4] text-[#087E83] flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-xs font-bold text-[#18343B]">
                      {coverUploading ? 'جاري الرفع والضغط...' : 'مساحة البانر العريضة'}
                    </span>
                    <span className="text-[10px] text-[#74838A]">
                      تظهر كخلفية رئيسية في بطاقة متجرك
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <label className="w-full h-10 px-4 rounded-xl bg-[#087E83] hover:bg-[#06666A] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>{coverUrl ? 'تغيير صورة البانر' : 'رفع صورة البانر'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {errors.cover && (
                <p className="text-[11px] font-bold text-rose-600 text-center">
                  {errors.cover}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4. Section: Store Data Fields (2 columns on large, 1 column on mobile) */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5EAED] shadow-card space-y-4">
          <div className="border-b border-[#E5EAED] pb-3">
            <h2 className="text-base font-extrabold text-[#18343B] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#087E83]" />
              <span>بيانات المتجر الأساسية</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 1: Store Name */}
            <div>
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                اسم المتجر <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    if (errors.storeName) setErrors((prev) => ({ ...prev, storeName: '' }));
                  }}
                  placeholder="مثال: متجر أدوات الأسنان، كافيه التقنية..."
                  className={`w-full h-11 px-3.5 rounded-xl border bg-white text-xs font-semibold text-[#18343B] outline-none transition ${
                    errors.storeName ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EAED] focus:border-[#087E83]'
                  }`}
                />
              </div>
              {errors.storeName && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">
                  {errors.storeName}
                </p>
              )}
            </div>

            {/* Field 2: Activity Type */}
            <div>
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                نوع النشاط <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={activityType}
                  onChange={(e) => {
                    setActivityType(e.target.value);
                    if (errors.activityType) setErrors((prev) => ({ ...prev, activityType: '' }));
                  }}
                  className={`w-full h-11 px-3.5 rounded-xl border bg-white text-xs font-semibold text-[#18343B] outline-none transition appearance-none ${
                    errors.activityType ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EAED] focus:border-[#087E83]'
                  }`}
                >
                  <option value="مأكولات ومشروبات">مأكولات ومشروبات</option>
                  <option value="مستلزمات دراسية وقرطاسية">مستلزمات دراسية وقرطاسية</option>
                  <option value="أدوات ومستلزمات طبية وطب أسنان">أدوات ومستلزمات طبية وطب أسنان</option>
                  <option value="إلكترونيات واكسسوارات">إلكترونيات واكسسوارات</option>
                  <option value="خدمات طلابية وتصوير">خدمات طلابية وتصوير</option>
                  <option value="ملابس ومقتنيات جامعية">ملابس ومقتنيات جامعية</option>
                  <option value="أخرى">أخرى</option>
                </select>
                <Tag className="w-4 h-4 text-[#74838A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.activityType && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">
                  {errors.activityType}
                </p>
              )}
            </div>

            {/* Field 3: Campus Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                موقع المتجر داخل الكلية <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={campusLocation}
                  onChange={(e) => {
                    setCampusLocation(e.target.value);
                    if (errors.campusLocation) setErrors((prev) => ({ ...prev, campusLocation: '' }));
                  }}
                  placeholder="مثال: الساحة الطلابية المركزية، مبنى كلية الهندسة، الدور الأرضي..."
                  className={`w-full h-11 pr-10 pl-3.5 rounded-xl border bg-white text-xs font-semibold text-[#18343B] outline-none transition ${
                    errors.campusLocation ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EAED] focus:border-[#087E83]'
                  }`}
                />
                <MapPin className="w-4 h-4 text-[#74838A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.campusLocation && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">
                  {errors.campusLocation}
                </p>
              )}
            </div>

            {/* Field 4: Store Description (Larger Textarea) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                وصف مختصر للمتجر
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="نبذة مختصرة عن متجرك، المنتجات التي تقدمها، وما يميز مشروعك للطلاب داخل الحرم الجامعي..."
                className="w-full p-3.5 rounded-xl border border-[#E5EAED] focus:border-[#087E83] bg-white text-xs font-medium text-[#18343B] outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 5. Section: Store Owner & Contact Details */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#E5EAED] shadow-card space-y-4">
          <div className="border-b border-[#E5EAED] pb-3">
            <h2 className="text-base font-extrabold text-[#18343B] flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#087E83]" />
              <span>بيانات صاحب المتجر</span>
            </h2>
            <p className="text-xs text-[#74838A] mt-1">
              تُستخدم لإدارة حساب المتجر والتواصل الرسمي وإشعارات الطلبات.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 1: Owner Name */}
            <div>
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                اسم صاحب المتجر <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => {
                    setOwnerName(e.target.value);
                    if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: '' }));
                  }}
                  placeholder="الاسم الثلاثي لصاحب المتجر"
                  className={`w-full h-11 pr-10 pl-3.5 rounded-xl border bg-white text-xs font-semibold text-[#18343B] outline-none transition ${
                    errors.ownerName ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EAED] focus:border-[#087E83]'
                  }`}
                />
                <UserIcon className="w-4 h-4 text-[#74838A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.ownerName && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">
                  {errors.ownerName}
                </p>
              )}
            </div>

            {/* Field 2: Contact Phone */}
            <div>
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                رقم الهاتف <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (errors.contactPhone) setErrors((prev) => ({ ...prev, contactPhone: '' }));
                  }}
                  placeholder="091XXXXXXX"
                  className={`w-full h-11 pr-3.5 pl-10 rounded-xl border bg-white text-xs font-en font-bold text-[#18343B] outline-none transition ${
                    errors.contactPhone ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EAED] focus:border-[#087E83]'
                  }`}
                />
                <Phone className="w-4 h-4 text-[#74838A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.contactPhone && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">
                  {errors.contactPhone}
                </p>
              )}
            </div>

            {/* Field 3: Contact Email */}
            <div>
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                البريد الإلكتروني <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    if (errors.contactEmail) setErrors((prev) => ({ ...prev, contactEmail: '' }));
                  }}
                  placeholder="store@campusmarket.ly"
                  className={`w-full h-11 pr-3.5 pl-10 rounded-xl border bg-white text-xs font-en font-semibold text-[#18343B] outline-none transition ${
                    errors.contactEmail ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EAED] focus:border-[#087E83]'
                  }`}
                />
                <Mail className="w-4 h-4 text-[#74838A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.contactEmail && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">
                  {errors.contactEmail}
                </p>
              )}
            </div>

            {/* Field 4: Invite Token (Optional) */}
            <div>
              <label className="block text-xs font-extrabold text-[#18343B] mb-1.5">
                رمز دعوة التفعيل الفوري <span className="text-[#74838A] font-normal">(اختياري)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="INV-XXXXX-2026"
                  className="w-full h-11 pr-3.5 pl-10 rounded-xl border border-[#E5EAED] focus:border-[#087E83] bg-white text-xs font-en font-bold text-[#087E83] outline-none transition"
                />
                <KeyRound className="w-4 h-4 text-[#74838A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-[#74838A] mt-1">
                إذا زُوّدت برمز دعوة خاص من إدارة المنصة، أدخله هنا للتفعيل الفوري.
              </p>
            </div>
          </div>
        </div>

        {/* 7. Submit Button */}
        <div className="pt-2 text-center space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-80 h-13 rounded-full bg-[#087E83] hover:bg-[#06666A] text-white text-sm font-extrabold shadow-md transition active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed mx-auto flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري إرسال الطلب...</span>
              </>
            ) : (
              <span>إرسال طلب إنشاء المتجر</span>
            )}
          </button>

          <p className="text-[11px] text-[#74838A]">
            بالضغط على إرسال، فإنك توافق على سياسات وشروط التجارة الطلابية داخل CampusMarket.
          </p>
        </div>
      </form>
    </div>
  );
};
