"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sellerHubNav } from "./sellerHubNav";
import Image from "next/image";

const SellerHubSidebar = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
  storeName,
  storeLogo,
}) => {
  const pathname = usePathname();

  const content = (
    <div
      className={cn(
        "flex h-full flex-col border-r-2 bg-white dark:bg-slate-900 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between border-b-2 px-4 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-gradient-to-br from-white to-slate-50 shadow-sm">
            <Image
              src={storeLogo || "/assets/MustangIPLog01.png"}
              alt="Store logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                Seller Hub
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {storeName}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={onCloseMobile}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {sellerHubNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              {!collapsed && (
                <span className={cn(
                  "transition-all",
                  isActive && "font-semibold"
                )}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t-2 px-4 py-4 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-muted-foreground font-medium text-center">
            Seller Hub powered by Mustang IP
          </p>
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
