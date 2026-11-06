# CampusMarket — سوق الكلية الجامعي (`PROJECT_STATE.md`)

## 1. Project Overview & Tech Stack
- **Platform**: **CampusMarket – سوق الكلية الجامعي** (Complete University Marketplace Platform — v2.0 Turquoise Redesign).
- **Tech Stack**:
  - Frontend: React 19 + TypeScript + Tailwind CSS v3 + Lucide Icons + React Router v7 (`HashRouter` for GitHub Pages compatibility).
  - Typography: `IBM Plex Sans Arabic` + `Plus Jakarta Sans` (RTL-first, Libyan Dinar `د.ل` currency).
  - Cloud Backend: Node.js + Express + PostgreSQL (`kuro_cloud`) hosted on **Libyan Spider Cloud VPS** (`102.203.202.115`), proxied via HTTPS Caddy at `https://api.kurofangs.id.ly/campus-market/api/*`.
  - Live Deployment: GitHub Pages (`https://7ij0d.github.io/campus-market/`).

## 2. Done & Verified (v2.0 Turquoise Redesign)
- **Complete Visual & Identity Redesign**:
  - Primary Dark Turquoise: `#087E83`
  - Secondary Medium Turquoise: `#36A6A6`
  - Main Background: `#F8FAFC`
  - Card Surface: `#FFFFFF`
  - Primary Text (Deep Navy): `#18343B`
  - Secondary Text (Slate Gray): `#74838A`
  - Borders & Dividers: `#E5EAED`
  - Offer / Highlight Accent (Calm Golden Yellow): `#F3C95B`
  - Strictly removed all old purple, orange, and red primary colors across all pages and dashboards.
- **Responsive Multi-Device Architecture (Mobile, Tablet, Laptop, Desktop)**:
  - **Mobile & Tablet**: Clean top header + content layout + fixed 5-item bottom navigation (`الرئيسية`, `البحث`, `المتاجر`, `طلباتي`, `حسابي`).
  - **Desktop & Laptop (`lg+`)**: Full top header with logo on the right, navigation pills in the center, profile/notifications/favorites on the left, wide search bar + `داخل الكلية` location selector, fixed right sidebar, and 2-column side-by-side sections for `المنتجات الأكثر طلباً` and `العروض الخاصة`.
- **Zero Demo / Fake Data Policy & Professional Empty States**:
  - Purged all demo stores, demo products, fake ratings, and fake orders from both local seed data (`src/data/seedData.ts`) and the **Libyan Spider PostgreSQL (`kuro_cloud`)** database (`stores: 0, products: 0, orders: 0`).
  - Implemented the exact Empty States shown in the reference designs for Home (`لا توجد منتجات حالياً`, `لا توجد عروض حالياً`), Stores (`لا توجد متاجر حالياً` + `+ كن تاجراً في CampusMarket`), Store Details (`/store/preview` & `/store/:storeId`), Search (`لا توجد نتائج مطابقة لبحثك`), Cart (`سلتك فارغة`), Orders (`لا توجد طلبات حالياً`), and Guest Account (`مرحباً بك - سجل الدخول لإدارة حسابك`).
- **Connected Admin & Merchant Dashboards (`/admin` & `/merchant`)**:
  - Full Turquoise redesign of `AdminDashboardPage.tsx` and `MerchantDashboardPage.tsx`.
  - Direct creation of Stores, Products, Services, Special Offers, Categories, and Banners from `/admin` immediately updates the live storefront and syncs to the Libyan Spider Cloud database.

## 3. Immediate Next Steps
- Add real student stores, products, and campus services via `/#/admin` or `/#/merchant`.
- Optional future enhancements: Push notifications (Web Push) and PDF invoice generation for completed campus orders.
