"use client";
import { usePathname } from "next/navigation";
import Header from "../Common/Header";
import Footer from "../Footer/Footer";
import PushNotificationLayout from "./PushNotificationLayout";
import Loading from "@/app/loading";
import UnderMaintenance from "../../public/assets/something_went_wrong.svg";
import { t } from "@/utils";
import { useClientLayoutLogic } from "./useClientLayoutLogic";
import CustomImage from "../Common/CustomImage";
import ScrollToTopButton from "./ScrollToTopButton";

export default function Layout({ children }) {
  const pathname = usePathname();
  const { isLoading, isMaintenanceMode, isRedirectToLanding } =
    useClientLayoutLogic();
  const isListYourPatentFlow = pathname === "/seller-signup";

  if (isLoading) {
    return <Loading />;
  }

  if (isRedirectToLanding) {
    return null;
  }

  if (isMaintenanceMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2">
        <CustomImage
          src={UnderMaintenance}
          alt="Maintenance Mode"
          height={255}
          width={255}
        />
        <p className="text-center max-w-[40%]">{t("underMaintenance")}</p>
      </div>
    );
  }

  return (
    <PushNotificationLayout>
      <div className="flex flex-col min-h-screen">
        {!isListYourPatentFlow && <Header />}
        <div className="flex-1">{children}</div>
        {!isListYourPatentFlow && <ScrollToTopButton />}
        {!isListYourPatentFlow && <Footer />}
      </div>
    </PushNotificationLayout>
  );
}