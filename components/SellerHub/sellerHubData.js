export const salesSummary = {
  totalSales: 124580.75,
  orders: 842,
  pendingShipments: 17,
  returns: 6,
};

export const revenueSeries = {
  daily: [
    { name: "Mon", revenue: 1240, orders: 18 },
    { name: "Tue", revenue: 1710, orders: 22 },
    { name: "Wed", revenue: 980, orders: 14 },
    { name: "Thu", revenue: 2210, orders: 26 },
    { name: "Fri", revenue: 1890, orders: 25 },
    { name: "Sat", revenue: 2050, orders: 28 },
    { name: "Sun", revenue: 1420, orders: 19 },
  ],
  weekly: [
    { name: "Week 1", revenue: 9120, orders: 118 },
    { name: "Week 2", revenue: 10450, orders: 132 },
    { name: "Week 3", revenue: 9870, orders: 121 },
    { name: "Week 4", revenue: 11890, orders: 152 },
  ],
  monthly: [
    { name: "Aug", revenue: 36420, orders: 461 },
    { name: "Sep", revenue: 38110, orders: 498 },
    { name: "Oct", revenue: 40280, orders: 526 },
    { name: "Nov", revenue: 42890, orders: 553 },
  ],
};

export const recentOrders = [
  {
    id: "ORD-10294",
    buyer: "Avery Stone",
    status: "Pending",
    payment: "Paid",
    total: 214.0,
    date: "2026-01-18",
  },
  {
    id: "ORD-10293",
    buyer: "Maya Brooks",
    status: "Shipped",
    payment: "Paid",
    total: 86.5,
    date: "2026-01-17",
  },
  {
    id: "ORD-10292",
    buyer: "Jordan Lee",
    status: "Delivered",
    payment: "Paid",
    total: 320.99,
    date: "2026-01-17",
  },
  {
    id: "ORD-10291",
    buyer: "Riley Chen",
    status: "Returned",
    payment: "Refunded",
    total: 119.0,
    date: "2026-01-16",
  },
];

export const topProducts = [
  {
    id: "SKU-4412",
    title: "Wireless Noise-Canceling Headphones",
    price: 149.99,
    sold: 86,
    revenue: 12899.14,
  },
  {
    id: "SKU-2341",
    title: "Smart Home Starter Kit",
    price: 89.99,
    sold: 74,
    revenue: 6659.26,
  },
  {
    id: "SKU-7822",
    title: "Premium Leather Backpack",
    price: 119.0,
    sold: 63,
    revenue: 7497.0,
  },
  {
    id: "SKU-5218",
    title: "Ergonomic Desk Chair",
    price: 229.0,
    sold: 41,
    revenue: 9389.0,
  },
];

export const performanceMetrics = [
  { label: "Order defect rate", value: 0.7, target: 2 },
  { label: "Late shipment rate", value: 1.4, target: 5 },
  { label: "Cancellation rate", value: 0.5, target: 2 },
];

export const orders = [
  {
    id: "ORD-10294",
    buyer: "Avery Stone",
    status: "Pending",
    payment: "Paid",
    total: 214.0,
    date: "2026-01-18",
  },
  {
    id: "ORD-10293",
    buyer: "Maya Brooks",
    status: "Shipped",
    payment: "Paid",
    total: 86.5,
    date: "2026-01-17",
  },
  {
    id: "ORD-10292",
    buyer: "Jordan Lee",
    status: "Delivered",
    payment: "Paid",
    total: 320.99,
    date: "2026-01-17",
  },
  {
    id: "ORD-10291",
    buyer: "Riley Chen",
    status: "Returned",
    payment: "Refunded",
    total: 119.0,
    date: "2026-01-16",
  },
  {
    id: "ORD-10290",
    buyer: "Taylor West",
    status: "Delivered",
    payment: "Paid",
    total: 59.95,
    date: "2026-01-15",
  },
];

export const listings = [
  {
    id: "LST-1001",
    title: "Wireless Noise-Canceling Headphones",
    sku: "SKU-4412",
    price: 149.99,
    quantity: 32,
    status: "Active",
  },
  {
    id: "LST-1002",
    title: "Smart Home Starter Kit",
    sku: "SKU-2341",
    price: 89.99,
    quantity: 12,
    status: "Active",
  },
  {
    id: "LST-1003",
    title: "Portable Photo Printer",
    sku: "SKU-9951",
    price: 129.0,
    quantity: 0,
    status: "Ended",
  },
  {
    id: "LST-1004",
    title: "Premium Leather Backpack",
    sku: "SKU-7822",
    price: 119.0,
    quantity: 24,
    status: "Draft",
  },
];

export const inventory = [
  {
    id: "INV-2001",
    title: "Wireless Noise-Canceling Headphones",
    sku: "SKU-4412",
    stock: 32,
    reorderPoint: 15,
    status: "Healthy",
  },
  {
    id: "INV-2002",
    title: "Smart Home Starter Kit",
    sku: "SKU-2341",
    stock: 12,
    reorderPoint: 20,
    status: "Low",
  },
  {
    id: "INV-2003",
    title: "Portable Photo Printer",
    sku: "SKU-9951",
    stock: 0,
    reorderPoint: 10,
    status: "Out",
  },
  {
    id: "INV-2004",
    title: "Ergonomic Desk Chair",
    sku: "SKU-5218",
    stock: 8,
    reorderPoint: 12,
    status: "Low",
  },
];

export const payouts = [
  {
    id: "PAYOUT-901",
    amount: 1120.5,
    status: "Completed",
    date: "2026-01-15",
    method: "Bank transfer",
  },
  {
    id: "PAYOUT-900",
    amount: 980.0,
    status: "Completed",
    date: "2026-01-08",
    method: "Bank transfer",
  },
  {
    id: "PAYOUT-899",
    amount: 1245.32,
    status: "Processing",
    date: "2026-01-01",
    method: "Bank transfer",
  },
];

export const transactions = [
  {
    id: "TX-3001",
    type: "Order",
    amount: 214.0,
    status: "Paid",
    date: "2026-01-18",
  },
  {
    id: "TX-3000",
    type: "Order",
    amount: 86.5,
    status: "Paid",
    date: "2026-01-17",
  },
  {
    id: "TX-2999",
    type: "Refund",
    amount: -119.0,
    status: "Refunded",
    date: "2026-01-16",
  },
];

export const conversations = [
  {
    id: "MSG-001",
    buyer: "Avery Stone",
    subject: "Order ORD-10294",
    preview: "Can you confirm the shipping ETA?",
    unread: true,
    lastMessageAt: "10:24 AM",
    messages: [
      {
        id: "m1",
        sender: "buyer",
        text: "Can you confirm the shipping ETA?",
        time: "10:24 AM",
      },
      {
        id: "m2",
        sender: "seller",
        text: "Absolutely! It ships today and should arrive in 3-5 business days.",
        time: "10:30 AM",
      },
    ],
  },
  {
    id: "MSG-002",
    buyer: "Maya Brooks",
    subject: "Return request",
    preview: "I submitted a return request.",
    unread: false,
    lastMessageAt: "Yesterday",
    messages: [
      {
        id: "m3",
        sender: "buyer",
        text: "I submitted a return request.",
        time: "Yesterday",
      },
      {
        id: "m4",
        sender: "seller",
        text: "Thanks for the update. I just approved it and sent the label.",
        time: "Yesterday",
      },
    ],
  },
];

export const returnRequests = [
  {
    id: "RET-801",
    orderId: "ORD-10291",
    buyer: "Riley Chen",
    reason: "Item not as described",
    status: "Pending",
    date: "2026-01-16",
  },
  {
    id: "RET-800",
    orderId: "ORD-10288",
    buyer: "Morgan Fields",
    reason: "Damaged in transit",
    status: "Approved",
    date: "2026-01-14",
  },
];

export const campaigns = [
  {
    id: "CMP-120",
    title: "Winter Clearance Sale",
    status: "Active",
    budget: 500,
    spent: 312,
    impressions: 18200,
  },
  {
    id: "CMP-119",
    title: "Sponsored Listings Boost",
    status: "Paused",
    budget: 300,
    spent: 198,
    impressions: 9600,
  },
];

export const storeProfile = {
  name: "Everlane Tech Shop",
  email: "seller@everlane-tech.com",
  phone: "+1 (415) 555-0144",
  address: "440 Market Street, San Francisco, CA",
  policy: "30-day returns, buyer pays shipping on returns.",
};
