"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { logoutSuccess, userSignUpData } from "@/redux/reducer/authSlice";
import SellerHubHeader from "./SellerHubHeader";
import SellerHubSidebar from "./SellerHubSidebar";
import { getNotificationList, logoutApi, sellerHubApi } from "@/utils/api";
import { toast } from "sonner";

const SellerHubLayout = ({ children }) => {
  const router = useRouter();
  const userData = useSelector(userSignUpData);
  const pathname = usePathname();
  const defaultStoreName = userData?.name ? `${userData.name}'s Store` : "Seller Hub";
  const [sellerProfile, setSellerProfile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSeller = async () => {
      try {
        const response = await sellerHubApi.getMe();
        const payload = response?.data?.data ?? response?.data;
        if (isMounted) {
          setSellerProfile(payload || null);
        }
      } catch (error) {
        if (isMounted) {
          setSellerProfile(null);
        }
      }
    };
    fetchSeller();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [notificationsResponse, messagesResponse] = await Promise.all([
          getNotificationList.getNotification({ page: 1 }),
          sellerHubApi.getMessages({ page: 1, perPage: 1 }),
        ]);
        const notificationsPayload = notificationsResponse?.data?.data ?? notificationsResponse?.data;
        const notificationsTotal =
          notificationsPayload?.total ??
          notificationsPayload?.count ??
          notificationsPayload?.meta?.total ??
          (Array.isArray(notificationsPayload?.data)
            ? notificationsPayload.data.length
            : Array.isArray(notificationsPayload)
              ? notificationsPayload.length
              : 0);

        const messagesPayload = messagesResponse?.data?.data ?? messagesResponse?.data;
        const messagesTotal =
          messagesPayload?.meta?.total ??
          messagesPayload?.total ??
          (Array.isArray(messagesPayload?.data)
            ? messagesPayload.data.length
            : Array.isArray(messagesPayload)
              ? messagesPayload.length
              : 0);

        if (isMounted) {
          setNotificationCount(notificationsTotal || 0);
          setMessageCount(messagesTotal || 0);
        }
      } catch (error) {
        if (isMounted) {
          setNotificationCount(0);
          setMessageCount(0);
        }
      }
    };
    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const storeName = useMemo(() => {
    if (sellerProfile?.store_name) return sellerProfile.store_name;
    return defaultStoreName;
  }, [sellerProfile, defaultStoreName]);

  const storeLogo = sellerProfile?.store_logo || null;
  const avatarUrl = sellerProfile?.store_logo || userData?.profile || userData?.image || null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutApi.logoutApi({
        ...(userData?.fcm_id && { fcm_token: userData?.fcm_id }),
      });
      logoutSuccess();
      localStorage.removeItem("token");
      toast.success("Signed out");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SellerHubHeader
        storeName={storeName}
        storeLogo={storeLogo}
        avatarUrl={avatarUrl}
        notificationCount={notificationCount}
        messageCount={messageCount}
        onNotificationsClick={() => router.push("/notifications")}
        onMessagesClick={() => router.push("/seller-dashboard/messages")}
        onProfileClick={() => router.push("/profile")}
        onBillingClick={() => router.push("/seller-dashboard/payments")}
        onSettingsClick={() => router.push("/seller-dashboard/settings")}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onSearch={(value) => {
          const target = pathname?.startsWith("/seller-dashboard")
            ? pathname
            : "/seller-dashboard/orders";
          router.push(`${target}?query=${encodeURIComponent(value)}`);
        }}
        onToggleSidebar={() => setCollapsed((prev) => !prev)}
        onOpenMobile={() => setMobileOpen(true)}
      />
      <div className="flex min-h-[calc(100vh-64px)]">
        <SellerHubSidebar
          storeName={storeName}
          storeLogo={storeLogo}
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
