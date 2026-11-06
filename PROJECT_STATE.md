# CampusMarket — سوق الكلية الجامعي (`PROJECT_STATE.md`)

## 1. Project Overview & Tech Stack
- **Platform**: **CampusMarket – سوق الكلية الجامعي** (v3.1 Presto-Grade Architecture).
- **Tech Stack**:
  - Frontend: React 19 + TypeScript + Tailwind CSS v3 + Lucide Icons + React Router v7 (`HashRouter` for GitHub Pages compatibility).
  - Typography: `IBM Plex Sans Arabic` + `Plus Jakarta Sans` (RTL-first, Libyan Dinar `د.ل` currency).
  - Color Tokens: Primary Dark Turquoise (`#087E83`), Medium Turquoise (`#36A6A6`), Primary Text (`#18343B`), Secondary Text (`#74838A`), Background (`#F8FAFC`), Surface (`#FFFFFF`), Border (`#E5EAED`).
  - Cloud Backend: Node.js + Express + PostgreSQL (`kuro_cloud`) hosted on **Libyan Spider Cloud VPS** (`102.203.202.115`), proxied via HTTPS Caddy at `https://api.kurofangs.id.ly/campus-market/api/*`.
  - Live Deployment: GitHub Pages (`https://7ij0d.github.io/campus-market/`).

## 2. Done & Verified (v3.1 Store Registration Redesign & Hours Removal)
- **Dedicated Store Registration Page (`src/pages/RegisterStorePage.tsx` at `/register-store`)**:
  - **Visual Hierarchy & Header**: Distinct title "إنشاء متجرك في CampusMarket" with subtitle and a compact 3-step indicator (`1. بيانات المتجر`, `2. صور المتجر`, `3. بيانات التواصل`).
  - **Clean Image Upload Slots (Zero Fake/Demo Food Graphics)**:
    - 1:1 Square Thumbnail Slot (`صورة المتجر المصغرة`) with file picker, instant client-side canvas compression, remove/change action, and live rendering.
    - ~3:1 Wide Banner Slot (`صورة بانر المتجر`) with file picker, aspect ratio guidance (1200x400), instant canvas compression, remove/change action, and live rendering.
    - URL alternate input option for both thumbnail and banner.
  - **Live Store Card Preview (`StoreCard previewMode`)**:
    - Real-time interactive preview showing exactly how the store card will appear to students on the Home Page and Stores List.
  - **Clean Form Structure**:
    - Store Details: Store Name, Activity Type, Campus Location, and Multiline Description.
    - Merchant Contact: Owner Full Name, Libyan Phone (`091/092/094/093/095` format validation), and Email (`@` validation).
    - Optional Instant-Activation Token field.
  - **Status & Anti-Duplication Handling**:
    - Default status set to `'pending'` (قيد المراجعة والاعتماد من قبل إدارة المنصة).
    - Double-click prevention with loading spinner state on `إرسال طلب إنشاء المتجر`.
    - Dedicated success confirmation screen with order tracking and direct home navigation.
- **Complete Elimination of Working Hours (`ساعات العمل`)**:
  - Permanently removed working hours fields, labels, inputs, and display badges from:
    - `RegisterStorePage.tsx`
    - `StoreDetailsPage.tsx` (header badge and about section)
    - `MerchantDashboardPage.tsx` (store settings form & update handler)
    - `AdminDashboardPage.tsx` (add/edit store modal and store preview)
    - `AccountPage.tsx` (merchant modal & preview)
    - `MarketplaceContext.tsx` (merchant creation & update payloads)
- **Verified Build & Tests**:
  - `tsc -b && vite build` successfully compiled with zero errors.

## 3. Immediate Next Steps
- Merchants can register their stores directly at: `https://7ij0d.github.io/campus-market/#/register-store`.
- Admins can review, approve, and manage stores at: `https://7ij0d.github.io/campus-market/#/admin`.
