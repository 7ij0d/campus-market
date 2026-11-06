# CampusMarket — سوق الكلية الجامعي (`PROJECT_STATE.md`)

## 1. Project Overview & Tech Stack
- **Platform**: **CampusMarket – سوق الكلية الجامعي** (v3.3 Three Completely Independent Interfaces: Customer, Merchant, Super Admin).
- **Tech Stack**:
  - Frontend: React 19 + TypeScript + Tailwind CSS v3 + Lucide Icons + React Router v7 (`HashRouter` for GitHub Pages compatibility).
  - Typography: `IBM Plex Sans Arabic` + `Plus Jakarta Sans` (RTL-first, Libyan Dinar `د.ل` currency).
  - Color Tokens: Primary Dark Turquoise (`#087E83`), Medium Turquoise (`#36A6A6`), Primary Text (`#18343B`), Secondary Text (`#74838A`), Background (`#F8FAFC`), Surface (`#FFFFFF`), Border (`#E5EAED`).
  - Cloud Backend: Node.js + Express + PostgreSQL (`kuro_cloud`) hosted on **Libyan Spider Cloud VPS** (`102.203.202.115`), proxied via HTTPS Caddy at `https://api.kurofangs.id.ly/campus-market/api/*`.
  - Live Deployment: GitHub Pages (`https://7ij0d.github.io/campus-market/`).

---

## 2. Done & Verified (v3.3 Full 3-Interface Architecture & Precision Reference UI)
### 1. واجهة الزبائن والطلبة — Customer Interface
- **Routes**: `/` (Home), `/stores` (All Stores), `/store/:storeId` (Store Details), `/product/:productId`, `/cart`, `/orders`, `/account`, `/notifications`, `/favorites`, `/register-store`.
- **Experience**: Clean student shopping experience with no merchant or admin controls visible. Customer bottom navigation bar and search bar active only within customer routes.
- **Order placement**: Stores with `visibility_status === 'pause_orders'` or `'closed_temp'` show informative banners and disable checkout while preserving browsing.
- **Product availability**: Products with status `'out_of_stock'`, `'depleted'`, `'hidden'`, or `'draft'` cannot be added to cart.

### 2. واجهة أصحاب المتاجر — Merchant Interface (مطابقة 100% للتصميم المرجعي)
- **Routes**: `/merchant/login` (and `/merchant-login`) & `/merchant/dashboard` (and `/merchant`).
- **Dedicated Login Screen (`MerchantLoginPage.tsx`)**:
  - Matches reference image (`media_1793975314831_ff72f18b.jpg` left side) pixel-for-pixel:
    - Turquoise wave gradient header + CampusMarket logo + vector university & storefront illustration.
    - Title: **دخول أصحاب المتاجر** | Subtitle: **سجّل دخولك لإدارة متجرك**.
    - Flexible login: Accepts Username (`store_username`), Store ID / Code (`STR-XXXX`), or registered email.
    - Password with `Eye`/`EyeOff` toggle.
    - `تذكّرني` checkbox + `نسيت كلمة المرور؟` modal.
    - Solid turquoise CTA button: **تسجيل الدخول**.
    - Bottom onboarding card: **ليس لديك متجر بعد؟ قدّم طلب إنشاء متجر**.
    - Seamless redirect directly into `/merchant` (no customer view).
- **Dedicated Dashboard Studio (`MerchantDashboardPage.tsx`)**:
  - Matches reference image (`media_1793975314831_ff72f18b.jpg` right side):
    - Top header: Notification bell with unread badge on left, CampusMarket logo on right, live store visibility toggle & store preview button.
    - Right Sidebar (RTL):
      - Circular store avatar with camera upload button.
      - Store name e.g. `متجر لاما`.
      - Green status pill: `• مفعل`.
      - Menu items: **الرئيسية**, **بيانات المتجر**, **المنتجات**, **الطلبات**, **التقييمات**, **إحصائيات**, **إعدادات الحساب**, **تسجيل الخروج**.
    - Main Overview Screen:
      - Mint rounded Welcome Banner with vector shop graphic ("OPEN" window, striped awning, trees).
      - 4 KPI cards: **زيارات المتجر** (views count), **إجمالي المنتجات** (products count), **إجمالي الطلبات** (orders count), **التقييم** (4.6 with gold star).
      - **إدارة المتجر** Card: Wide banner & logo preview with camera upload buttons + Edit pencil icon + `• مفعل` pill.
      - 4 Quick Action Cards: `+ إضافة منتج جديد`, `إدارة المنتجات`, `إدارة الطلبات`, `عرض التقييمات`.
    - Complete self-service editing:
      - Store self-settings (name, username, store code, password, contact data).
      - Product catalog with 5 availability statuses and color/size variants.
      - Order workflow (all 9 statuses with customer notifications).
      - Store visibility controls (`active`, `pause_orders`, `closed_temp`, `hidden`).
      - Customer reviews reply mechanism (`merchantReplyToReview`).

### 3. واجهة الإدارة الرئيسية — Super Admin Omnipotent Control Suite
- **Routes**: `/admin/login` (and `/admin-login`) & `/admin/dashboard` (and `/admin`).
- **Comprehensive Store & Merchant Account Editing (`adminFullUpdateStoreAndMerchant`)**:
  - Super Admin can modify all parameters of ANY store in one place:
    - Store name (`name_ar`, `name_en`).
    - Merchant Username (`@username`) with uniqueness enforcement.
    - Store Code (`STR-XXXX`) with uniqueness enforcement.
    - Password management: Enter custom password or instant 1-click random generator (`CM@XXXX`).
    - Logo & Banner Cover: In-browser camera upload, automatic canvas compression, or image URL with live card preview.
    - Activity type, location inside campus, contact phone, description, category.
    - Store status: Active, Pending, Suspended.
    - Order visibility status: Active, Paused, Closed temporarily, Hidden.
    - Merchant User Account status: Active vs Inactive (ban/allow login).
- **Direct Merchant & Store Creation (`adminDirectCreateStoreAndMerchant`)**:
  - Super Admin can create a new store and its merchant credentials from scratch with one click, without needing an invite token.
- **One-Click Store Impersonation (`adminImpersonateStore`)**:
  - Super Admin can click "دخول كتاجر" on any store to jump directly into that store's merchant dashboard at `/merchant` to manage products, catalog, and orders without knowing the merchant's password.
  - Floating Executive Return Banner: Displays `👁️ أنت تتصفح وتدير متجر "... " بصلاحية الإدارة الرئيسية — [العودة للوحة الإدارة المركزية]`.
- **Strict Role & Data Isolation**:
  - Merchants are strictly restricted to `currentUser.store_id` and have zero access to other stores or admin controls.
  - Super Admin possesses omnipotent, central control across all stores, products, orders, and users.

---

## 3. URLs & Direct Access (GitHub Pages SPA Bridge)
- **واجهة الزبائن والطلبة**: `https://7ij0d.github.io/campus-market/#/`
- **دخول أصحاب المتاجر**: `https://7ij0d.github.io/campus-market/#/merchant/login` (أو مباشرة `https://7ij0d.github.io/campus-market/merchant/login`)
- **لوحة تحكم المتجر**: `https://7ij0d.github.io/campus-market/#/merchant`
- **دخول الإدارة الرئيسية**: `https://7ij0d.github.io/campus-market/#/admin/login` (أو مباشرة `https://7ij0d.github.io/campus-market/admin/login`)
- **لوحة الإدارة الرئيسية**: `https://7ij0d.github.io/campus-market/#/admin`

## 4. Routing & Deep-Linking Fixes Verified
- Added `public/404.html` SPA routing bridge to automatically map direct paths to React Router routes on GitHub Pages.
- Auto-guarded `/admin` and `/merchant` to redirect unauthenticated users directly to their login screens (`/admin/login` and `/merchant/login`).
- Added Global Footer and Account page gateway buttons (`دخول التجار` و `دخول الإدارة`) for 1-click access inside the app without typing URLs.
