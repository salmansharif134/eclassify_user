# Seller Dashboard (eBay-style) Setup

This update adds a complete Seller Hub experience under `/seller-dashboard` with
eBay-like navigation, layout, and workflows. The backend is already in Laravel,
so the UI currently uses mock data and is ready to be wired to the Laravel APIs.

## Run Locally

1. Install dependencies:
   - `npm install`
2. Start the Next.js app:
   - `npm run dev`
3. Open `http://localhost:3000/seller-dashboard`

## Laravel Backend Integration

The new Seller Hub pages use demo data from `components/SellerHub/sellerHubData.js`.
Replace the mock data with Laravel API calls in these components:

- `components/SellerHub/pages/OverviewPage.jsx`
- `components/SellerHub/pages/OrdersPage.jsx`
- `components/SellerHub/pages/ListingsPage.jsx`
- `components/SellerHub/pages/InventoryPage.jsx`
- `components/SellerHub/pages/PerformancePage.jsx`
- `components/SellerHub/pages/MarketingPage.jsx`
- `components/SellerHub/pages/PaymentsPage.jsx`
- `components/SellerHub/pages/MessagesPage.jsx`
- `components/SellerHub/pages/ReturnsPage.jsx`
- `components/SellerHub/pages/SettingsPage.jsx`

Suggested flow:
- Create Laravel endpoints for seller analytics, orders, listings, payouts,
  messaging, and returns.
- Add corresponding API wrappers in `utils/api.js`.
- Swap the mock data in the Seller Hub pages with real API responses.

## Notes

- Charts are built with Recharts.
- Sidebar + header layout lives in `components/SellerHub/SellerHubLayout.jsx`.
- Routes are under `app/seller-dashboard/*`.
