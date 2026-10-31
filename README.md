# Little Stars

A complete, responsive clothing boutique demo built with React 19, TypeScript, Vite, Tailwind CSS 4, and React Router.
Local asynchronous repositories provide a realistic API boundary without a backend.

## Run

Use Node.js 22 or later.

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173). To verify and preview production:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

Browser journey tests use Playwright and Chromium; see `playwright.config.ts` for executable configuration. Run
`npm run test:e2e`. The browser configuration starts Vite automatically, or reuses a running development server. For
other machines, install Chromium with `npx playwright install chromium` and set `CHROMIUM_PATH` to its executable if
necessary.

## Features

- Editorial homepage, women/men/kids collections, new arrivals, sale, and 24 realistic products.
- URL-based search, filters, sort, and pagination. Direct page loads and browser navigation work with Vite. Production
  hosts must serve `index.html` for unmatched routes (SPA fallback).
- Required color/size selections, variant stock checks, quantity limits, photo galleries, image enlargement, size
  guides, and related pieces.
- Persistent wishlist, synchronized bag drawer and cart page, coupons, free-shipping progress, and stock-aware variant
  lines.
- Validated guest checkout, delivery choices, demo payment, duplicate-submission protection, immutable order snapshots,
  confirmation, and local order history.
- Demo account without passwords, editable profile, sign-out, contact/newsletter validation, all supporting pages, and
  useful missing-page/product states.
- Keyboard focus trapping, Escape dismissal and focus restoration for dialogs/drawers, image fallbacks, responsive
  layouts, reduced-motion support, and locally served photography/fonts.

## Commerce rules

All amounts are integer USD cents. `src/lib/config.ts` centralizes rules:

| Rule               | Demo value                                                    |
|--------------------|---------------------------------------------------------------|
| Coupon             | `STAR10`: 10% off merchandise subtotal of $50 or more         |
| Standard shipping  | $6.95; free at $125 merchandise subtotal **before discounts** |
| Express shipping   | $14.95, including orders over the free standard threshold     |
| Tax                | Excluded from this demo; zero tax is collected                |
| Delivery estimates | Standard 5–7 business days; express 2–3 business days         |

`calculateTotals` is shared by cart, checkout, and order creation, including rounding to the nearest cent. Each order
saves the purchased item names, variants, prices, quantities, delivery details, and totals as a snapshot. Stock is
illustrative and is validated per variant; this static demo does not reserve or decrement inventory after ordering.

**Demo checkout. No payment will be collected.** No real authentication, payment, shipment, email, newsletter
subscription, or form submission occurs. Use fictional contact/address information. Demo orders and profile details are
kept on this device only. Policy and product claims are sample content. Product photography is illustrative; color
selection does not recolor the photo. Detail gallery photographs are alternate crops, not a claim of a second physical
product view.

## Project structure

```text
src/
  components/           Shared UI, dialogs, images, navigation, cards
  features/
    catalog/            Catalog/search/filter and product selection
    cart/               Shared persistent state, full cart/drawer contents
    checkout/           Guest checkout and confirmation
    account/            Demo profile and order history
  lib/                  Models, configuration, pricing, storage, focused tests
  services/             Typed repositories and local mock implementations
  pages/                Home, wishlist, informational and fallback pages
public/
  images/               Local editorial/product photos and SVG fallback
  fonts/                Local fonts
```

Components access catalog data through `catalogService` or the service-backed shared store. Only the catalog repository
imports product fixtures. Corrupted JSON, unknown products/variants, stale quantities, invalid order snapshots, and
denied local storage are handled without crashing. Order creation reports a failed persistent save and preserves the
bag. Cart/wishlist/profile/coupon updates synchronize between browser tabs.

## Reset local demo data

Run this in the browser developer console, then refresh:

```js
Object.keys(localStorage)
  .filter(key => key.startsWith('little-stars:') || key === 'ls-announcement')
  .forEach(key => localStorage.removeItem(key));
location.reload();
```

The versioned prefix is `little-stars:v1:`. Browser storage is not a secure account or a database. Clearing it removes
demo history. Browsers with storage disabled can browse, but cannot finish an order that cannot be saved.

## Future Spring Boot integration

Replace implementations behind `CatalogRepository`, `AccountRepository`, and `CheckoutRepository` in `src/services`
while retaining their asynchronous contracts. Suggested endpoints:

| Interface             | Future REST endpoint                                       |
|-----------------------|------------------------------------------------------------|
| Catalog search        | `GET /api/products` with query parameters                  |
| Product lookup        | `GET /api/products/{id}` or `/api/products/by-slug/{slug}` |
| Profile read/update   | `GET /api/me`, `PUT /api/me`                               |
| Place order           | `POST /api/orders` with an idempotency key                 |
| Order history/details | `GET /api/orders`, `GET /api/orders/{id}`                  |

Map API DTOs to `src/lib/types.ts` in the service layer, including currency in cents and variant IDs. Spring Boot must
authoritatively validate stock, prices, shipping, discounts, and taxes; never trust browser totals. The server should
persist immutable order snapshots and atomically reserve stock, enforce idempotency, provide real authentication and
authorization, and return structured validation errors. Add those only when integrating the actual backend. No
speculative backend infrastructure is included.

## Verification

Focused Vitest tests cover pricing, rounding, coupon eligibility, shipping, variant identity, stock limits, stale carts,
catalog search, order snapshots, persistence, idempotency, invalid orders, and malformed storage. Playwright journey
tests cover the core storefront experience in desktop and mobile Chromium. Review generated artifacts in `artifacts/`
when present.

Local images are downloaded from Unsplash; source mapping is documented in `public/images/sources.json`. DM Sans and
Libre Caslon Display are Google Fonts distributed under the SIL Open Font License; their licenses are included with the
fonts.

### Completed checks

- ESLint, TypeScript, and production build: passed.
- Vitest: 15 tests passed.
- Playwright Chromium: 17 tests passed, including light/dark purchase journeys, theme persistence/system
  updates/cross-tab synchronization, early theme application, Telegram, and form validation.
- Additional browser scan: 22 routes, no console errors or broken images, and no horizontal overflow at 320, 390, 768,
  and 1024 pixels.
- Screenshots: `artifacts/home-desktop.png`, `artifacts/home-mobile.png`, `artifacts/catalog-desktop.png`, and
  `artifacts/product-desktop.png`.

## Telegram contact

Customers can contact [@LittleStarsShop](https://t.me/LittleStarsShop) from the cart drawer/page, checkout, order
confirmation, saved order details, contact page, and footer. Change `telegramUsername` in `src/lib/config.ts` to update
the destination everywhere.

Shopping and order links open Telegram in a new tab with an editable draft containing item names, selected variants,
quantities, the total, and (for a saved order) its reference. Customer names, shipping addresses, and email addresses
are excluded. Opening a link does not send a message or place an order; customers review and send it themselves. No
Telegram bot token or backend is needed. The store must own and monitor this Telegram account.

## Appearance themes

Choose **Light**, **Dark**, or **System** using the header’s Color theme selector. On phones and tablets, open the
navigation drawer to find the selector. System is the default and follows device appearance changes while the store is
open. Your choice is saved under `little-stars:v1:theme` and synchronizes between tabs.

`public/theme-init.js` applies the saved or system theme in the document head before the application renders, avoiding a
light flash when dark mode is active. `src/features/theme/ThemeProvider.tsx` manages the preference; `src/themes.css`
defines dark semantic palette tokens, while existing styles retain their original light fallbacks. Product photography
and editorial photo overlays retain their original colors. When browser storage is blocked, selection still works for
the current session. Resetting local demo data also resets the theme.
