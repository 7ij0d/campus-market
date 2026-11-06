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

### 3. واجهة الإدارة الرئيسية — Super Admin Interface
- **Routes**: `/admin/login` (and `/admin-login`) & `/admin/dashboard` (and `/admin`).
- **Dedicated Login Screen (`AdminLoginPage.tsx`)**:
  - Dark obsidian executive theme (`#0F172A`), Shield icon, and master credentials.
- **Admin Studio Dashboard (`AdminDashboardPage.tsx`)**:
  - Real-time KPIs for students, stores, products, orders, and sales volume.
  - Store management: Approve pending applications, issue/reset merchant credentials (`STR-XXXX`, username, temporary password), toggle store status, edit or delete stores.
  - Global product catalog & order auditing across all campus stores.

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
