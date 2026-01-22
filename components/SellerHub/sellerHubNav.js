import {
  BarChart3,
  LayoutGrid,
  Mail,
  Megaphone,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Store,
  Wallet,
} from "lucide-react";

export const sellerHubNav = [
  { name: "Overview", href: "/seller-dashboard", icon: LayoutGrid },
  { name: "Orders", href: "/seller-dashboard/orders", icon: ShoppingCart },
  { name: "Listings", href: "/seller-dashboard/listings", icon: Store },
  { name: "Inventory", href: "/seller-dashboard/inventory", icon: Package },
  { name: "Performance", href: "/seller-dashboard/performance", icon: BarChart3 },
  { name: "Marketing", href: "/seller-dashboard/marketing", icon: Megaphone },
  { name: "Payments", href: "/seller-dashboard/payments", icon: Wallet },
  { name: "Messages", href: "/seller-dashboard/messages", icon: Mail },
  { name: "Returns", href: "/seller-dashboard/returns", icon: RotateCcw },
  { name: "Settings", href: "/seller-dashboard/settings", icon: Settings },
];
