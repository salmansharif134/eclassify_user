# Seller Dashboard API Reference

This document lists all frontend endpoints used by the Seller Dashboard and the
expected payloads. It includes filters, pagination, and action routes used in the UI.

## Base

All endpoints are under `/seller/*` and require seller authentication.

## Overview

### GET `/seller/dashboard`
Returns the Seller Hub overview data.

Query params:
- `query` (optional) - global search/filter keyword

Response:
```
{
  "salesSummary": {
    "totalSales": 124580.75,
    "orders": 842,
    "pendingShipments": 17,
    "returns": 6
  },
  "revenueSeries": {
    "daily": [ ... ],
    "weekly": [ ... ],
    "monthly": [ ... ]
  },
  "recentOrders": [ ... ],
  "topProducts": [ ... ],
  "performanceMetrics": [ ... ]
}
```

## Orders

### GET `/seller/orders`
List seller orders (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)
- `status` (optional) - `pending | shipped | delivered | returned`
- `payment` (optional) - `paid | refunded`
- `query` (optional) - search by order id or buyer
- `date` (optional) - ISO date

Response:
```
{
  "data": [
    {
      "id": "ORD-10294",
      "buyer": "Avery Stone",
      "status": "Pending",
      "payment": "Paid",
      "total": 214.0,
      "date": "2026-01-18"
    }
  ],
  "meta": { "page": 1, "perPage": 10, "total": 54 }
}
```

### GET `/seller/orders/{order}`
Order details.

Response:
```
{
  "id": "ORD-10294",
  "buyer": "Avery Stone",
  "status": "Pending",
  "payment": "Paid",
  "total": 214.0,
  "date": "2026-01-18",
  "items": [
    { "id": 1, "title": "Product A", "quantity": 1, "price": 99.0 }
  ],
  "shipping_address": "123 Main St, NY"
}
```

### POST `/seller/orders/{order}/ship`
Mark an order as shipped.

### POST `/seller/orders/{order}/refund`
Refund an order.

## Listings

### GET `/seller/listings/meta`
Listing metadata for the create/edit form.

Response:
```

### GET `/seller/listings/categories`
Search categories for listing form.

Query params:
- `query` (optional)

Response:
```
{
  "data": [
    { "id": 1, "name": "Electronics" },
    { "id": 2, "name": "Home & living" }
  ]
}
```

---

## Categories

### GET `/seller/categories`
List categories (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)
- `query` (optional)

Response:
```
{
  "data": [
    { "id": 1, "name": "Electronics", "slug": "electronics", "parent_id": null, "parent_name": null }
  ],
  "meta": { "page": 1, "perPage": 10, "total": 12 }
}
```

### POST `/seller/categories`
Create a category.

Body:
```
{ "name": "New Category", "slug": "new-category", "parent_id": null }
```

### PUT `/seller/categories/{category}`
Update a category.

Body:
```
{ "name": "Updated", "slug": "updated", "parent_id": 1 }
```

### DELETE `/seller/categories/{category}`
Delete a category.
{
  "categories": [
    { "id": 1, "name": "Electronics" },
    { "id": 2, "name": "Home & living" }
  ],
  "shippingProfiles": [
    { "id": 10, "name": "Standard shipping" },
    { "id": 11, "name": "Expedited shipping" }
  ]
}
```

### GET `/seller/listings`
List seller listings (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)
- `status` (optional) - `active | draft | ended`
- `query` (optional) - search by title/sku

Response:
```
{
  "data": [
    {
      "id": "LST-1001",
      "title": "Wireless Headphones",
      "sku": "SKU-4412",
      "price": 149.99,
      "quantity": 32,
      "status": "Active",
      "image": "https://..."
    }
  ],
  "meta": { "page": 1, "perPage": 10, "total": 44 }
}
```

### GET `/seller/listings/{product}`
Get listing details (edit form prefill).

Response:
```
{
  "id": "LST-1001",
  "title": "Wireless Headphones",
  "category": "electronics",
  "description": "...",
  "price": 149.99,
  "compare_at_price": 169.99,
  "cost": 90,
  "tax_rate": 7.5,
  "sku": "SKU-4412",
  "quantity": 32,
  "barcode": "123456",
  "warehouse": "WH-A",
  "weight": 1.2,
  "dimensions": "8x6x4",
  "handling_time": 2,
  "shipping_profile": "standard"
}
```

### POST `/seller/listings`
Create a listing (multipart form-data).

Fields:
- `title`, `category`, `description`
- `price`, `compare_at_price`, `cost`, `tax_rate`
- `sku`, `quantity`, `barcode`, `warehouse`
- `weight`, `dimensions`, `handling_time`, `shipping_profile`
- `status` (optional) - `draft | active`
- `images[]` (files)

### PUT `/seller/listings/{product}`
Update a listing (multipart form-data). Same fields as create.

### DELETE `/seller/listings/images/{image}`
Delete a listing image by ID.

### POST `/seller/listings/{product}/end`
End a listing.

### POST `/seller/listings/{product}/duplicate`
Duplicate a listing.

## Inventory

### GET `/seller/inventory`
Inventory view for seller (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)
- `lowStock` (optional) - `1` for low stock only
- `query` (optional) - search by title/sku

Response:
```
{
  "data": [
    {
      "id": "INV-2001",
      "title": "Wireless Headphones",
      "sku": "SKU-4412",
      "stock": 32,
      "reorderPoint": 15,
      "status": "Healthy"
    }
  ],
  "meta": { "page": 1, "perPage": 10, "total": 120 }
}
```

### POST `/seller/inventory/{item}/adjust`
Adjust stock for a specific inventory item.

Body:
```
{ "quantity": 24 }
```

## Shipping Profiles

### POST `/seller/shipping-profiles`
Create a shipping profile.

Body:
```
{
  "name": "Standard shipping",
  "description": "3-5 business days",
  "carrier": "UPS",
  "handling_time": 2
}
```

## Performance

### GET `/seller/performance`
Performance metrics summary.

Query params:
- `query` (optional)

Response:
```
{
  "performanceMetrics": [
    { "label": "Order defect rate", "value": 0.7, "target": 2 }
  ],
  "revenueSeries": {
    "weekly": [ ... ]
  }
}
```

## Payments

### GET `/seller/payments`
Payments list (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)
- `query` (optional)

Response:
```
{
  "balanceSummary": {
    "balance": 3482.75,
    "available": 2910.5,
    "pending": 572.25,
    "next_payout_in_days": 3,
    "pending_label": "Orders in processing"
  },
  "payouts": [ ... ],
  "transactions": [ ... ],
  "meta": { "page": 1, "perPage": 10, "total": 66 }
}
```

## Messages

### GET `/seller/messages`
Message threads (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)
- `query` (optional)

Response:
```
{
  "data": [
    {
      "id": 123,
      "buyer": "Avery Stone",
      "subject": "Question about your listing",
      "preview": "Is this still available?",
      "lastMessageAt": "2026-01-18"
    }
  ],
  "meta": { "page": 1, "perPage": 20, "total": 10 }
}
```

### GET `/seller/messages/{thread}`
Messages for a thread (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)

Response:
```
{
  "messages": [
    {
      "id": 1,
      "sender": "buyer",
      "body": "Hello",
      "sent_at": "2026-01-18 10:02"
    }
  ]
}
```

### POST `/seller/messages`
Send a message (create thread or reply).

Body (reply):
```
{ "thread_id": 123, "body": "Hello" }
```

Body (new thread):
```
{ "buyer_id": 45, "subject": "Question", "body": "Hello" }
```

## Returns

### GET `/seller/returns`
Return requests (paginated).

Query params:
- `page` (optional)
- `perPage` (optional)
- `query` (optional)

Response:
```
{
  "data": [
    {
      "id": "RET-1001",
      "orderId": "ORD-10294",
      "buyer": "Avery Stone",
      "reason": "Damaged",
      "status": "Pending"
    }
  ],
  "meta": { "page": 1, "perPage": 10, "total": 12 }
}
```

### POST `/seller/returns/{returnRequest}/approve`
Approve return.

### POST `/seller/returns/{returnRequest}/reject`
Reject return.

## Settings

### GET `/seller/me`
Current seller profile basics.

Response:
```
{
  "store_name": "Mustang IP Store",
  "store_logo": "https://..."
}
```

### GET `/seller/settings`
Seller settings.

Response:
```
{
  "store_name": "Mustang IP Store",
  "email": "support@example.com",
  "phone": "+1-555-0123",
  "address": "123 Main St",
  "policy": "Return within 30 days",
  "payment_method": "Bank ****4821",
  "tax_id": "12-3456789",
  "shipping_preferences": {
    "carrier": "UPS",
    "handling_time": 2,
    "free_shipping": true
  },
  "tax_settings": {
    "default_rate": 7.5,
    "nexus_states": "CA,NY"
  }
}
```

### PUT `/seller/settings`
Update seller settings.

Body (examples):
```
{
  "store_name": "New Store Name",
  "email": "support@example.com",
  "phone": "+1-555-0123",
  "address": "123 Main St",
  "policy": "Return within 30 days"
}
```

```
{
  "payment_method": "Bank ****4821",
  "tax_id": "12-3456789"
}
```

```
{
  "shipping_preferences": {
    "carrier": "UPS",
    "handling_time": 2,
    "free_shipping": true
  }
}
```

```
{
  "tax_settings": {
    "default_rate": 7.5,
    "nexus_states": "CA,NY"
  }
}
```

---

## Laravel Mapping

Suggested Laravel route/controller mapping for the Seller Dashboard.

### routes/api.php

```
Route::middleware(['auth:api', 'role:seller'])->prefix('seller')->group(function () {
    Route::get('/dashboard', [SellerDashboardController::class, 'overview']);

    Route::get('/orders', [SellerOrdersController::class, 'index']);
    Route::get('/orders/{order}', [SellerOrdersController::class, 'show']);
    Route::post('/orders/{order}/ship', [SellerOrdersController::class, 'ship']);
    Route::post('/orders/{order}/refund', [SellerOrdersController::class, 'refund']);

    Route::get('/listings', [SellerListingsController::class, 'index']);
    Route::get('/listings/{product}', [SellerListingsController::class, 'show']);
    Route::post('/listings', [SellerListingsController::class, 'store']);
    Route::put('/listings/{product}', [SellerListingsController::class, 'update']);
    Route::post('/listings/{product}/end', [SellerListingsController::class, 'end']);
    Route::post('/listings/{product}/duplicate', [SellerListingsController::class, 'duplicate']);
    Route::get('/categories', [SellerCategoriesController::class, 'index']);
    Route::post('/categories', [SellerCategoriesController::class, 'store']);
    Route::put('/categories/{category}', [SellerCategoriesController::class, 'update']);
    Route::delete('/categories/{category}', [SellerCategoriesController::class, 'destroy']);

    Route::get('/inventory', [SellerInventoryController::class, 'index']);
    Route::get('/performance', [SellerPerformanceController::class, 'index']);
    Route::get('/payments', [SellerPaymentsController::class, 'index']);
    Route::get('/messages', [SellerMessagesController::class, 'index']);
    Route::get('/messages/{thread}', [SellerMessagesController::class, 'show']);
    Route::post('/messages', [SellerMessagesController::class, 'send']);
    Route::get('/returns', [SellerReturnsController::class, 'index']);
    Route::post('/returns/{returnRequest}/approve', [SellerReturnsController::class, 'approve']);
    Route::post('/returns/{returnRequest}/reject', [SellerReturnsController::class, 'reject']);

    Route::get('/me', [SellerSettingsController::class, 'me']);
    Route::get('/settings', [SellerSettingsController::class, 'show']);
    Route::put('/settings', [SellerSettingsController::class, 'update']);
});
```

### Suggested Controllers

Create these controllers under `app/Http/Controllers/Seller`:

- `SellerDashboardController`
- `SellerOrdersController`
- `SellerListingsController`
- `SellerCategoriesController`
- `SellerInventoryController`
- `SellerPerformanceController`
- `SellerPaymentsController`
- `SellerMessagesController`
- `SellerReturnsController`
- `SellerSettingsController`

---

## Database Tables Used

These tables are referenced by the Seller Dashboard APIs:

- `users`
- `seller_profiles`
- `products`
- `categories`
- `orders`
- `order_items`
- `payments`
- `message_threads`
- `messages`
- `return_requests`

### Suggested Key Columns

`seller_profiles`
- `user_id`, `store_name`, `store_logo`
- `shipping_preferences` (json)
- `tax_settings` (json)
- `payment_method`, `tax_id`

`products`
- `user_id` (seller)
- `title`, `sku`, `price`, `quantity`, `status`
- `images` (json)

`categories`
- `name`, `slug`, `parent_id` (nullable)

`orders`
- `user_id` (seller)
- `buyer_name`, `status`, `payment_status`, `total_amount`, `placed_at`

`order_items`
- `order_id`, `product_id`, `quantity`, `price`

`payments`
- `order_id`, `method`, `amount`, `status`, `paid_at`

`message_threads`
- `seller_id`, `buyer_id`, `subject`, `last_message_at`

`messages`
- `thread_id`, `sender_id`, `body`, `sent_at`

`return_requests`
- `order_id`, `reason`, `status`, `requested_at`, `resolved_at`

---

## Laravel Mapping

Suggested Laravel route/controller mapping for the Seller Dashboard.

### routes/api.php

```
Route::middleware(['auth:api', 'role:seller'])->prefix('seller')->group(function () {
    Route::get('/dashboard', [SellerDashboardController::class, 'overview']);

    Route::get('/orders', [SellerOrdersController::class, 'index']);
    Route::get('/orders/{order}', [SellerOrdersController::class, 'show']);
    Route::post('/orders/{order}/ship', [SellerOrdersController::class, 'ship']);
    Route::post('/orders/{order}/refund', [SellerOrdersController::class, 'refund']);

    Route::get('/listings', [SellerListingsController::class, 'index']);
    Route::get('/listings/{product}', [SellerListingsController::class, 'show']);
    Route::post('/listings', [SellerListingsController::class, 'store']);
    Route::put('/listings/{product}', [SellerListingsController::class, 'update']);
    Route::post('/listings/{product}/end', [SellerListingsController::class, 'end']);
    Route::post('/listings/{product}/duplicate', [SellerListingsController::class, 'duplicate']);

    Route::get('/inventory', [SellerInventoryController::class, 'index']);
    Route::get('/performance', [SellerPerformanceController::class, 'index']);
    Route::get('/marketing', [SellerMarketingController::class, 'index']);
    Route::get('/payments', [SellerPaymentsController::class, 'index']);
    Route::get('/messages', [SellerMessagesController::class, 'index']);
    Route::get('/messages/{thread}', [SellerMessagesController::class, 'show']);
    Route::post('/messages', [SellerMessagesController::class, 'send']);
    Route::get('/returns', [SellerReturnsController::class, 'index']);
    Route::post('/returns/{returnRequest}/approve', [SellerReturnsController::class, 'approve']);
    Route::post('/returns/{returnRequest}/reject', [SellerReturnsController::class, 'reject']);

    Route::get('/me', [SellerSettingsController::class, 'me']);
    Route::get('/settings', [SellerSettingsController::class, 'show']);
    Route::put('/settings', [SellerSettingsController::class, 'update']);
});
```

### Suggested Controllers

Create these controllers under `app/Http/Controllers/Seller`:

- `SellerDashboardController`
- `SellerOrdersController`
- `SellerListingsController`
- `SellerInventoryController`
- `SellerPerformanceController`
- `SellerMarketingController`
- `SellerPaymentsController`
- `SellerMessagesController`
- `SellerReturnsController`
- `SellerSettingsController`

---

## Database Tables Used

These tables are referenced by the Seller Dashboard APIs:

- `users`
- `seller_profiles`
- `products`
- `orders`
- `order_items`
- `payments`
- `message_threads`
- `messages`
- `return_requests`

### Suggested Key Columns

`seller_profiles`
- `user_id`, `store_name`, `store_logo`
- `shipping_preferences` (json)
- `tax_settings` (json)
- `payment_method`, `tax_id`

`products`
- `user_id` (seller)
- `title`, `sku`, `price`, `quantity`, `status`
- `images` (json)

`orders`
- `user_id` (seller)
- `buyer_name`, `status`, `payment_status`, `total_amount`, `placed_at`

`order_items`
- `order_id`, `product_id`, `quantity`, `price`

`payments`
- `order_id`, `method`, `amount`, `status`, `paid_at`

`message_threads`
- `seller_id`, `buyer_id`, `subject`, `last_message_at`

`messages`
- `thread_id`, `sender_id`, `body`, `sent_at`

`return_requests`
- `order_id`, `reason`, `status`, `requested_at`, `resolved_at`
