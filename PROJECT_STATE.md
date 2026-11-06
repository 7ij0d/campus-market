# CampusMarket — سوق الكلية الجامعي (`PROJECT_STATE.md`)

## 1. Project Overview & Tech Stack
- **Platform**: **CampusMarket – سوق الكلية الجامعي** (v3.0 Presto-Style Stores-First Architecture).
- **Tech Stack**:
  - Frontend: React 19 + TypeScript + Tailwind CSS v3 + Lucide Icons + React Router v7 (`HashRouter` for GitHub Pages compatibility).
  - Typography: `IBM Plex Sans Arabic` + `Plus Jakarta Sans` (RTL-first, Libyan Dinar `د.ل` currency).
  - Cloud Backend: Node.js + Express + PostgreSQL (`kuro_cloud`) hosted on **Libyan Spider Cloud VPS** (`102.203.202.115`), proxied via HTTPS Caddy at `https://api.kurofangs.id.ly/campus-market/api/*`.
  - Live Deployment: GitHub Pages (`https://7ij0d.github.io/campus-market/`).

## 2. Done & Verified (v3.0 Presto-Style Stores-First Redesign)
- **Complete Purge of Legacy/Demo Stores & Products**:
  - Purged all stores, products, offers, and orders from both local storage (`STORAGE_KEY = 'campus_market_db_v3_presto_clean'` with automatic cleanup of older `localStorage` keys) and the **Libyan Spider PostgreSQL (`kuro_cloud`)** database (`stores: 0, products: 0, orders: 0`).
- **Streamlined Presto-Style Home Page (`Header → Main Banner → Stores Directly`)**:
  - Removed all category bars, electronics/clothing/study supplies sections, most ordered product sections, and special offer product sections from the Home Page.
  - Built [`StoreCard.tsx`](file:///C:/Users/Taha/.gemini/antigravity/scratch/campus-market/src/components/StoreCard.tsx) matching the reference design: wide store banner image (`cover_url`), circular store thumbnail (`logo_url`), store name underneath, real store rating (`لا توجد تقييمات بعد` when 0 ratings, or `★ average (count)` when rated), and open/closed status pill (`مفتوح الآن` / `مغلق الآن`).
  - Responsive layout: 1-column vertical list on mobile, 2-column grid on tablet/laptop (`md:grid-cols-2`).
- **Merchant Store Image Upload & Live Preview System (`src/utils/imageUpload.ts`)**:
  - Store owners can upload a circular thumbnail (`صورة المتجر المصغرة`) and wide store banner (`صورة بانر المتجر`) from their device (compressed via HTML5 Canvas and persisted in PostgreSQL) or paste an image URL, with live `<StoreCard previewMode />` preview before saving, both during onboarding (`/account?become_merchant=1`) and inside `MerchantDashboardPage` (`/merchant`).
- **Store Details Page & Real Store Rating Engine (`StoreDetailsPage.tsx`)**:
  - Displays the store's wide banner, circular thumbnail, store name, real rating, description, working hours, campus location, and all products/services belonging exclusively to that store.
  - Students who complete an order from a store can rate the store (1–5 stars + comment), automatically updating the store's rating average and count across the platform.
- **Admin Dashboard (`AdminDashboardPage.tsx`)**:
  - Supports reviewing new store subscription requests (`قبول واعتماد` / `إيقاف`), editing store thumbnails & banners with live preview, permanently deleting stores (`adminDeleteStore`), managing products/services, moderating reviews, and customizing the main Home Page Hero Banner.

## 3. Immediate Next Steps
- Subscribe new student stores from `/#/account?become_merchant=1` or add them directly from `/#/admin`.
