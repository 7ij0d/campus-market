# CampusMarket — سوق الكلية الجامعي (`PROJECT_STATE.md`)

## 1. Project Overview & Tech Stack
- **Platform**: **CampusMarket – سوق الكلية الجامعي** (v3.2 Merchant Independent Authentication & Elevated Studio).
- **Tech Stack**:
  - Frontend: React 19 + TypeScript + Tailwind CSS v3 + Lucide Icons + React Router v7 (`HashRouter` for GitHub Pages compatibility).
  - Typography: `IBM Plex Sans Arabic` + `Plus Jakarta Sans` (RTL-first, Libyan Dinar `د.ل` currency).
  - Color Tokens: Primary Dark Turquoise (`#087E83`), Medium Turquoise (`#36A6A6`), Primary Text (`#18343B`), Secondary Text (`#74838A`), Background (`#F8FAFC`), Surface (`#FFFFFF`), Border (`#E5EAED`).
  - Cloud Backend: Node.js + Express + PostgreSQL (`kuro_cloud`) hosted on **Libyan Spider Cloud VPS** (`102.203.202.115`), proxied via HTTPS Caddy at `https://api.kurofangs.id.ly/campus-market/api/*`.
  - Live Deployment: GitHub Pages (`https://7ij0d.github.io/campus-market/`).

## 2. Done & Verified (v3.2 Merchant Independent Authentication & Studio Layout)
- **Dedicated Merchant Login Screen (`src/pages/MerchantLoginPage.tsx` at `/merchant-login`)**:
  - Implemented exact visual hierarchy matching reference design (`media_1793975314831_ff72f18b.jpg` left side):
    - Top header branding: CampusMarket + mortarboard cap logo + store awning illustration.
    - Title: **دخول أصحاب المتاجر** | Subtitle: **سجّل دخولك لإدارة متجرك**.
    - Flexible Login Identifier: Supports Username (اسم المستخدم) or Store ID / Unique Code (`STR-XXXX`) or registered Email.
    - Password Input with toggleable `Eye` / `EyeOff` show/hide.
    - `تذكّرني` (Remember me) checkbox and `نسيت كلمة المرور؟` (Forgot password popup).
    - Primary CTA button: **تسجيل الدخول** with log-in icon.
    - Bottom onboarding card: **ليس لديك متجر بعد؟ قدّم طلب إنشاء متجر** (redirects to `/register-store`).
    - Redirects directly to `/merchant` upon successful authentication (zero customer redirect).
- **Elevated Merchant Dashboard Layout (`src/pages/MerchantDashboardPage.tsx` at `/merchant`)**:
  - Implemented exact visual layout matching reference design (`media_1793975314831_ff72f18b.jpg` right side):
    - Right Sidebar (RTL layout) with:
      - Store Avatar circle with Camera icon for instant thumbnail upload & canvas compression.
      - Store Name and Active Badge (`● مفعل` or `● بانتظار الاعتماد`).
      - Full vertical navigation menu:
        1. **الرئيسية** (Overview)
        2. **بيانات المتجر** (Store Info)
        3. **المنتجات** (Products)
        4. **الطلبات** (Orders)
        5. **التقييمات** (Reviews)
        6. **إحصائيات** (Analytics & Reports)
        7. **إعدادات الحساب** (Account Settings & Password Change)
        8. **تسجيل الخروج** (Logout -> `/merchant-login`)
    - Main Overview Screen:
      - Soft mint/teal Welcome Banner with Open store graphic: *"مرحبًا بك في لوحة متجرك — قم بإدارة منتجاتك وطلباتك وتحديث بيانات متجرك بكل سهولة."*
      - 4 Metric KPI Cards: **زيارات المتجر** (Store Visits), **إجمالي المنتجات** (Total Products), **إجمالي الطلبات** (Total Orders), **التقييم** (Rating average).
      - **إدارة المتجر** Card with wide banner & circular logo preview (each equipped with camera upload button) + Edit pencil icon + 4 Quick Action Pills (`+ إضافة منتج جديد`, `إدارة المنتجات`, `إدارة الطلبات`, `عرض التقييمات`).
    - Account Settings & Password Update:
      - Display of Username, Store ID (`STR-XXXX`), Email, and Phone.
      - Form to change password with mandatory first-login prompt if `must_change_password` is set.
- **Strict Role & Data Isolation**:
  - Merchants can only query and mutate data where `product.store_id === currentUser.store_id`, `order.store_id === currentUser.store_id`, and `review.store_id === currentUser.store_id`.
  - Customer accounts, merchant accounts, and admin accounts are strictly segregated.
- **Admin Dashboard Integration (`AdminDashboardPage.tsx`)**:
  - When approving pending stores, admins can issue or reset merchant credentials (`adminIssueMerchantCredentials`).
  - Dedicated "بيانات الدخول" button per store with modal displaying: Username, Store Code, Temporary Password, and one-click "نسخ بيانات الدخول للتاجر" button.

## 3. Immediate Next Steps
- Merchants can log in directly at: `https://7ij0d.github.io/campus-market/#/merchant-login`.
- Manage products and orders at: `https://7ij0d.github.io/campus-market/#/merchant`.
- Admins can manage credentials and approve stores at: `https://7ij0d.github.io/campus-market/#/admin`.
