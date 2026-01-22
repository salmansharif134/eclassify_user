"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sellerHubNav } from "./sellerHubNav";

const SellerHubSidebar = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
  storeName,
}) => {
  const pathname = usePathname();

  const content = (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-white",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary/10" />
          {!collapsed && (
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Seller Hub
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {storeName}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onCloseMobile}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {sellerHubNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t px-4 py-4 text-xs text-muted-foreground">
          Seller Hub powered by Mustang IP
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={onCloseMobile} />
          <div className="relative z-50">{content}</div>
        </div>
      )}
    </>
  );
};

export default SellerHubSidebar;
