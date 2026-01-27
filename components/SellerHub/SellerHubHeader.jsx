"use client";

import { useState } from "react";
import { Bell, Menu, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SellerHubHeader = ({
  storeName,
  storeLogo,
  onToggleSidebar,
  onOpenMobile,
  onSearch,
  notificationCount = 0,
  messageCount = 0,
  onNotificationsClick,
  onMessagesClick,
  onProfileClick,
  onBillingClick,
  onSettingsClick,
  onLogout,
  isLoggingOut = false,
  avatarUrl,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed) {
      onSearch?.(trimmed);
    }
  };
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-white px-4 py-3 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobile}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white">
            <Image
              src={storeLogo || "/assets/MustangIPLog01.png"}
              alt="MustangIP"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Store</p>
            <p className="text-lg font-semibold text-slate-900">{storeName}</p>
          </div>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders, listings, buyers"
            className="pl-9"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={onNotificationsClick}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[20px] h-5 rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white flex items-center justify-center shadow-md animate-pulse">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={onMessagesClick}
        >
          <MessageCircle className="h-5 w-5" />
          {messageCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[20px] h-5 rounded-full bg-blue-500 px-1.5 text-[11px] font-bold text-white flex items-center justify-center shadow-md animate-pulse">
              {messageCount > 99 ? "99+" : messageCount}
            </span>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-2 hover:border-primary/50 transition-all shadow-sm">
              <span className="hidden text-sm font-semibold md:inline">
                Account
              </span>
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white shadow-sm">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Account"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">A</span>
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-lg border-2">
            <DropdownMenuLabel className="font-semibold">Seller Profile</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">View profile</DropdownMenuItem>
            <DropdownMenuItem onClick={onBillingClick} className="cursor-pointer">Billing</DropdownMenuItem>
            <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onLogout} 
              disabled={isLoggingOut}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default SellerHubHeader;
