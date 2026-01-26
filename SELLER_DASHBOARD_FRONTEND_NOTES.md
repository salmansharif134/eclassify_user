# Seller Dashboard Frontend Notes

This file captures the frontend-facing expectations and integration notes for
the Seller Dashboard.

## Required API base URL
- Point the frontend API base URL to the Laravel server, not the Next.js dev
  server.
- Example: `http://localhost:8000/api`

## Auth notes (Sanctum cookies)
- If using Sanctum cookie auth from Next.js:
  - Call `GET /sanctum/csrf-cookie` before login.
  - Send requests with `credentials: "include"`.

## Seller dashboard routes (frontend)
- Example route for create listing:
  - `/seller-dashboard/listings/new`
- These are frontend-only routes and must be handled by the Next.js app.

## Seller API endpoints used by the UI
- `GET /api/seller/listings/meta`
- `GET /api/seller/listings/categories`
- `GET /api/seller/listings`
- `GET /api/seller/listings/{product}`
- `POST /api/seller/listings`
- `PUT /api/seller/listings/{product}`
- `DELETE /api/seller/listings/images/{image}`
- `POST /api/seller/listings/{product}/end`
- `POST /api/seller/listings/{product}/duplicate`
- `GET /api/seller/inventory`
- `POST /api/seller/inventory/{item}/adjust`
- `POST /api/seller/shipping-profiles`
- `GET /api/seller/payments`
- `GET /api/seller/messages`
- `GET /api/seller/returns`
- `GET /api/seller/settings`

## Buyer listing visibility
- When a seller creates/updates a listing, a buyer `Item` record is created
  or updated automatically.
- Buyer listing API `GET /api/get-item` now defaults to `status=approved` when
  no status is provided.

## Migrations required
- `php artisan migrate`
