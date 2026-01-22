"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";
import SellerHubHeader from "./SellerHubHeader";
import SellerHubSidebar from "./SellerHubSidebar";

const SellerHubLayout = ({ children }) => {
  const userData = useSelector(userSignUpData);
  const storeName = userData?.name ? `${userData.name}'s Store` : "Seller Hub";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SellerHubHeader
        storeName={storeName}
        onToggleSidebar={() => setCollapsed((prev) => !prev)}
        onOpenMobile={() => setMobileOpen(true)}
      />
      <div className="flex min-h-[calc(100vh-64px)]">
        <SellerHubSidebar
          storeName={storeName}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
};

export default SellerHubLayout;
