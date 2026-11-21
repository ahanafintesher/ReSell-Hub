# ReSell Hub — Full Browser-Based QA, Debugging & Verification Report

**Frontend Repository:** https://github.com/ahanafintesher/ReSell-Hub  
**Backend Reference:** https://github.com/ahanafintesher/ReSell-Hub-Server  
**Frontend URL:** http://localhost:3000  
**Backend URL:** http://localhost:5000  
**Date:** November 21, 2026  
**Execution Mode:** Antigravity Agent Mode  
**Task Type:** Real Browser Testing + Debugging + Code Fixing + Regression Verification  

---

## 1. Executive Summary

A comprehensive, real browser QA audit and debugging milestone was executed across ReSell Hub using Google Chrome and Playwright browser automation. Rather than relying solely on static inspection or mocks, every page, link, form, dropdown, dialog, modal, and responsive viewport was opened, interacted with, and audited directly in a live running browser instance against both the local frontend and backend servers.

Real browser console errors and network request logs were captured, revealing concrete bugs:
1. **React State-in-Render Warning in CartProvider:** `toast.success` and `toast.error` side-effects were invoked inside the pure state updater callback of `setItems((prev) => ...)`, triggering React 19's `Cannot update a component while rendering a different component`.
2. **Hydration Error (`<button>` inside `<button>`) in Navbar and DashboardNavbar:** HeroUI 3's `<Dropdown.Trigger>` and `<DropdownTrigger>` render an HTML `<button>` internally. Placing a manual `<button>` element inside these triggers caused HTML nesting violations and React hydration errors across all public and dashboard pages, as well as pointer-event interception on logout.
3. **Empty Featured Listings on Homepage:** `getFeaturedProducts()` called `/api/featured`, but the backend routed `/api/featured` to featured categories instead of products. Because the returned JSON lacked product attributes, `getFeaturedProducts` returned empty and the section conditionally rendered `null`.
4. **Unprotected Admin Route Crashing Server Actions (HTTP 500):** When non-admin users (such as buyers) visited `/dashboard/admin/*`, the absence of server-side role layout boundaries allowed admin server actions (`getAdminUsers()`) to execute, which threw 403 errors and surfaced as HTTP 500 internal server errors.

All four issues were identified via browser test execution, traced to source files, resolved with minimal surgical fixes, and empirically verified with 0 browser console errors, 0 network failures, passing tests, and zero horizontal overflow across 9 viewports.

---

## 2. Section A — Environment & Startup

| Parameter | Observed Status & Values | Notes |
|---|---|---|
| **Frontend Server** | **RUNNING** (`http://localhost:3000`) | Process ID 22384, Next.js 16.2.9 with Turbopack, React 19.2.4 |
| **Backend Server** | **RUNNING** (`http://localhost:5000`) | Process ID 16612, Express.js server |
| **Database Availability** | **CONNECTED** (MongoDB `resell_hub`) | 7 users, 16 verified products, 10 orders live in database |
| **Node.js Version** | **v26.1.0** | Compatible with modern ES modules |
| **npm Version** | **11.13.0** | Clean dependency tree |
| **Browser Engine** | **Google Chrome 157.0.8103.80** | Launched via Playwright `chromium.launch({ executablePath })` |
| **Playwright Version** | **v1.65.1** | Headless browser execution with full CDP DevTools integration |
| **Environment Limitations** | Real payment processing disabled | Stripe test mode used; transactions halted prior to real card charge |

---

## 3. Section B — Browser Test Results

A full browser test cycle (`scripts/browser-qa-suite.mjs`) was executed.

### 1. Routes Visited & Tested

- **Public Routes:**
  - `/` (Home landing, Hero, Featured Listings, Popular Categories, Stats, Stories, Top Sellers, CTA, Footer)
  - `/products` (Marketplace catalog, Keyword search, Category filter, Sorting, Price range, Pagination)
  - `/products/[productId]` (Authoritative details route, Image, Condition, Price in BDT, Add to Cart, Buy Now, Report Listing)
  - `/categories` (9 backend categories, search filter, category badges, product link routing)
  - `/cart` (Cart items list, quantity increment/decrement, subtotal recalculation, clear cart, checkout routing)
  - `/checkout` (Shipping form, order review, buyer data autofill, Stripe session generation)
  - `/about` (Mission statement, circular economy philosophy, FAQ accordion)
  - `/contact` (Contact details, inquiry form, mailto handler, clipboard copy action)
  - `/auth/login` (Email/password login, validation, session persistence, role-based redirects)
  - `/auth/register` (Account creation form, role selector, password confirmation)
- **Buyer Dashboard:**
  - `/dashboard/buyer/overview` (KPI cards, active orders, recent transactions)
  - `/dashboard/buyer/orders` (Order status tracking, acceptance, delivery details)
  - `/dashboard/buyer/wishlist` (Saved items, direct buy/remove actions)
  - `/dashboard/buyer/payment-history` (Transaction logs, payment amounts, status pills)
  - `/dashboard/buyer/profile` (Account profile info, location, contact data)
- **Seller Dashboard:**
  - `/dashboard/seller/overview` (Seller sales metrics, quick actions)
  - `/dashboard/seller/products/add-products` (Dynamic category loading from `getAllCategories()`, image upload, moderation status initialization)
  - `/dashboard/seller/products/my-products` (Inventory management, status badges, pending moderation alert)
  - `/dashboard/seller/orders` (Manage customer orders, shipping status)
  - `/dashboard/seller/analytics` (Seller revenue timeline, order distribution, top products table, 3-tier responsive cards)
- **Admin Dashboard:**
  - `/dashboard/admin/overview` (Platform statistics, system overview)
  - `/dashboard/admin/users` (User management, role filters, HeroUI 3 AlertDialog block modal)
  - `/dashboard/admin/products` (Product catalog moderation, approve/reject listing actions)
  - `/dashboard/admin/reports` (Dispute & listing report queue, dismiss/resolve actions)
  - `/dashboard/admin/orders` (Platform-wide order oversight)
  - `/dashboard/admin/payments` (Transaction log audit)
  - `/dashboard/admin/disputes` (Dispute arbitration)
  - `/dashboard/admin/analytics` (Platform analytics, volume, Recharts trends, category distribution table, 3-tier responsive cards)

### 2. Interactions Tested

- **Navigation:**
  - Top logo click navigates to `/`.
  - Hero CTA click navigates to `/products`.
  - Primary navbar links (`Products`, `Categories`, `Dashboard`) navigate correctly.
  - User menu dropdown opens and options link to respective role dashboards.
  - Mobile hamburger button opens slide-out drawer; link click navigates and automatically closes drawer.
- **Product Card & Buy Now:**
  - "Buy Now" button on `ProductsCard.jsx` links strictly to `/products/[productId]`.
  - Clicking "Buy Now" does not trigger "Add to Cart" or parent container click handlers (`stopPropagation` verified).
  - Product title and image click independently navigate to `/products/[productId]`.
  - Sold-out products render disabled "Sold Out" button preventing purchase.
  - Details page contains working "Buy Now" linking to `/checkout?productId=...` and independent "Add to Cart" button.
- **Cart Lifecycle:**
  - Adding an item on details page increments cart badge in navbar.
  - `/cart` loads items from localStorage without cascading re-renders.
  - Clicking `+` increments quantity and updates line total and subtotal.
  - "Proceed to Checkout" button navigates to `/checkout`.
- **Seller Product Form:**
  - Dynamic category selector loads all 9 backend categories ("Electronics", "Audio", "Wearables", "Accessories", "Fashion", "Furniture", "Vehicles", "Mobile Phones", "Others").
  - Form validation blocks empty submissions.
  - Submitted payload includes `status: "pending"` and `moderationStatus: "pending"`.
- **Product Reporting & User Blocking:**
  - Product card & details flag buttons open `ReportProductModal`.
  - Non-owner validation blocks reporting own listing.
  - Reason selector validates required category.
  - Admin users page "Block" button triggers accessible HeroUI `AlertDialog`.
  - Escape key dismisses dialog cleanly without modifying state.
  - Cancel button dismisses dialog cleanly.
- **Analytics & Tables:**
  - Admin & Seller analytics render Recharts container visualizations (AreaChart, BarChart, PieChart).
  - Tables switch smoothly to responsive 2-column cards on tablet and 1-column cards on mobile.

### 3. Console & Network Summary

- **Initial Run:** 83 console errors (repetitive `<button>` inside `<button>` nesting across all dashboard routes + CartProvider setState error); 1 network failure (500 error when buyer accessed `/dashboard/admin/users`).
- **Post-Fix Run:** **0 Console Errors**, **0 Network Failures**.

---

## 4. Section C — Bug Register

| ID | Bug Summary | Affected Route / Component | Root Cause | Fix Applied | Browser Verification | Status |
|---|---|---|---|---|---|---|
| **BUG-01** | React State-in-Render Warning in CartProvider | `/products/[id]`, `/cart` (`src/context/CartContext.jsx`) | `toast.success` and `toast.error` were invoked inside `setItems((prev) => ...)` pure state updater callbacks, violating React 19 pure function rules and updating `Toaster` during render. | Moved all `toast` notifications outside `setItems` callbacks; computed state immutably before setting state. | Clicked "Add to Cart", verified toast displayed with 0 console warnings. | **FIXED & VERIFIED** |
| **BUG-02** | Hydration Error (`<button>` inside `<button>`) in Navbar | All public pages (`src/components/Navbar/Navbar.jsx`) | `<Dropdown.Trigger>` from `@heroui/react` internally renders a `<button data-slot="dropdown-trigger">`. An inner `<button>` was nested inside it, violating HTML5 specifications. | Moved attributes (`className`, `aria-label`) directly to `<Dropdown.Trigger>`, removing inner redundant `<button>`. Added `pointer-events-none` to inner logout label. | Re-audited navbar across public routes; verified 0 hydration errors. | **FIXED & VERIFIED** |
| **BUG-03** | Hydration Error in Dashboard Navbar | All dashboard pages (`src/components/Dashboard/DashboardNavbar.jsx`) | `<DropdownTrigger>` from `@heroui/react` renders a `<Button>` internally. An inner `<button type="button">` was placed inside it, triggering hydration errors on every dashboard route. | Transferred classes and `aria-label` directly to `<DropdownTrigger>`, removing the inner `<button>`. | Navigated all 18 dashboard routes; verified 0 console errors. | **FIXED & VERIFIED** |
| **BUG-04** | Featured Listings section missing on Homepage | `/` (`src/lib/actions/getProducts.js`, `FeaturedProducts.jsx`) | Backend `/api/featured` returns featured categories instead of products. `getFeaturedProducts()` received categories without product fields, causing `FeaturedProducts` to return `null`. | Updated `getFeaturedProducts()` to validate product schema in `/api/featured` and fallback to `getProducts({ limit: 6, status: "available" })`. | Homepage loaded; verified "Featured Listings" renders 6 dynamic product cards. | **FIXED & VERIFIED** |
| **BUG-05** | HTTP 500 Network Error on Unauthorized Admin Access | `/dashboard/admin/*` (`src/app/dashboard/admin/layout.jsx`) | No server-side role layout boundary existed for `/dashboard/admin`. When a buyer navigated to `/dashboard/admin/users`, privileged server action `getAdminUsers()` failed with 403, bubbling up as an unhandled 500 error. | Created `src/app/dashboard/admin/layout.jsx` and `src/app/dashboard/seller/layout.jsx` to enforce role authorization on the server, redirecting unauthorized users to `/dashboard/buyer/overview` before privileged Server Actions execute. | Visited `/dashboard/admin/users` as buyer; verified clean server redirect with HTTP 200/307 and 0 network failures. | **FIXED & VERIFIED** |

---

## 5. Section D — Responsive Test Results

A full responsive matrix was evaluated using Playwright across 9 viewports on 6 critical application pages (54 total combinations). Each combination was evaluated via `document.documentElement.scrollWidth > window.innerWidth` to verify zero horizontal overflow:

| Viewport Profile | Width (px) | Height (px) | Audited Routes | Horizontal Overflow | Result |
|---|---:|---:|---|:---:|:---:|
| **Small Mobile** | 320 | 568 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Mobile** | 375 | 812 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Mobile** | 390 | 844 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Large Mobile** | 430 | 932 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Tablet** | 768 | 1024 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Laptop** | 1024 | 768 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Desktop** | 1280 | 800 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Large Desktop** | 1440 | 900 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |
| **Wide Desktop** | 1920 | 1080 | `/`, `/products`, `/categories`, `/cart`, `/dashboard/admin/analytics`, `/dashboard/seller/analytics` | None (0px) | **PASS** |

### Responsive Layout Observations
- **320px–430px (Mobile):** Navbar switches to compact header with mobile drawer toggle. Dashboard tables transform to stacked single-column cards with full metrics and actions visible.
- **768px (Tablet):** Analytics tables transform into 2-column grid cards. All metric numbers, percentages, and status chips remain intact.
- **1024px+ (Desktop):** Full multi-column tables with `overflow-x-auto` container, desktop navigation header, and persistent dashboard sidebar render properly.

---

## 6. Section E — Build & Automated Test Results

### 1. ESLint (`npm run lint`)
- **Command:** `npm run lint`
- **Exit Code:** `0`
- **Output:** Clean exit, 0 lint warnings or errors.

### 2. Node.js Test Suite (`npm run test`)
- **Command:** `npm run test` (`node --test test/categories-api.test.mjs test/frontend-requirements.test.mjs`)
- **Exit Code:** `0`
- **Results:**
  - `test/categories-api.test.mjs`: 5 passed, 0 failed.
  - `test/frontend-requirements.test.mjs`: 17 passed, 0 failed.
  - **Total:** **22 passed, 0 failed, 0 skipped**.

### 3. Production Build (`npm run build`)
- **Command:** `npm run build`
- **Compiler:** Next.js 16.2.9 (Turbopack)
- **Exit Code:** `0`
- **Results:** All 39 static and dynamic routes compiled and optimized successfully.

---

## 7. Section F — Test Evidence & Screenshots

All screenshots are stored under `test-evidence/browser-qa/` organized as required:

### `before-fixes/`
- `01_homepage_initial.png`: Initial homepage render before repairs.

### `after-fixes/`
- `homepage_featured_listings_active.png`: Homepage with working "Featured Listings" product grid.
- `report_modal_active.png`: Product report modal active with authenticated user and reason selector.
- `admin_block_dialog_active.png`: HeroUI 3 accessible `AlertDialog` for user blocking.
- `checkout_page_verified.png`: Checkout page review and delivery form.
- `final_verified_products.png`: Marketplace catalog after navigation and cart repairs.

### `navigation/`
- `02_hero_cta_to_products.png`: CTA navigation to `/products`.
- `03_products_page.png`: Products catalog page.
- `04_buynow_product_details.png`: Buy Now button navigation landing directly on `/products/[productId]`.
- `05_cart_page.png`: Shopping cart with live items and calculated subtotal.
- `public_about.png`: `/about` route rendered.
- `public_contact.png`: `/contact` route rendered.
- `public_categories.png`: `/categories` route with 9 categories rendered.
- `public_auth_login.png`: Login screen rendered.
- `public_auth_register.png`: Registration screen rendered.

### `dashboard/`
- `buyer_overview.png`, `buyer_orders.png`, `buyer_wishlist.png`, `buyer_payment_history.png`, `buyer_profile.png`
- `seller_overview.png`, `seller_add_products.png`, `seller_my_products.png`, `seller_orders.png`, `seller_analytics.png`
- `admin_overview.png`, `admin_manage_users.png`, `admin_manage_products.png`, `admin_reports.png`, `admin_orders.png`, `admin_payments.png`, `admin_disputes.png`, `admin_analytics.png`
- `admin_user_block_alertdialog.png`: Block modal confirmation evidence.

### `responsive/`
- `home_Small_Mobile_320x568.png`
- `home_Mobile_375x812.png`
- `home_Mobile_390x844.png`
- `home_Large_Mobile_430x932.png`
- `home_Tablet_768x1024.png`
- `home_Laptop_1024x768.png`
- `home_Desktop_1280x800.png`
- `home_Large_Desktop_1440x900.png`
- `home_Wide_Desktop_1920x1080.png`

---

## 8. Section G — Remaining Issues

| Issue Description | Severity | Impact | Recommendation |
|---|---|---|---|
| **Backend Moderation Enforcement:** The backend server (`L:\resell-hub-server`) does not enforce `status: "pending"` on product creation or update if a client bypasses the frontend form, and does not default public queries to `status=available` when unauthenticated requests omit `status`. | **HIGH (Backend Scope)** | Does not compromise frontend application behavior because the frontend sends `status: "pending"` and enforces defensive filtering. However, direct API queries could access unapproved items. | Patch backend `products.routes.js` to unconditionally set `status: "pending"` on seller product creation. |
| **Backend `/api/featured` Route Conflict:** In `L:\resell-hub-server`, `/api/featured` in `categories.routes.js` shadows `/api/featured` in `products.routes.js`. | **MEDIUM (Backend Scope)** | Mitigated cleanly on frontend by falling back to `getProducts({ limit: 6, status: "available" })`. | Separate backend route names (e.g. `/api/categories/featured` vs `/api/products/featured`). |

---

## 9. Section H — Final Verdict

### **PASS**

All required checks within authorized frontend scope have been systematically tested in a real browser, debugged, resolved, and verified.
- Critical "Buy Now" navigates to authoritative product details.
- Add to Cart, Cart quantity updates, and Checkout routing are fully functional.
- Dynamic backend category integration (9 categories) verified on both `/categories` and seller product creation.
- HeroUI 3 accessible AlertDialog for admin user blocking verified with Escape dismissal and duplicate guard.
- 3-tier responsive cards verified across all dashboard tables with 0 horizontal overflow across 9 viewports (320px to 1920px).
- Zero console errors and zero network failures recorded during full browser regression.
- `npm run lint`, `npm run test` (22/22 pass), and `npm run build` all exit with code 0.
