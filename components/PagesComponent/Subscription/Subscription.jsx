"use client";
import { useEffect, useState } from "react";
import AddListingPlanCard from "@/components/PagesComponent/Cards/AddListingPlanCard";
import {
  assigFreePackageApi,
  getPackageApi,
  getPaymentSettingsApi,
  membershipPlansApi,
} from "@/utils/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { t } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { CurrentLanguageData, getIsRtl } from "@/redux/reducer/languageSlice";
import { useSelector } from "react-redux";
import Layout from "@/components/Layout/Layout";
import { getIsLoggedIn } from "@/redux/reducer/authSlice";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import { toast } from "sonner";
import BankDetailsModal from "./BankDetailsModal";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import AdListingPublicPlanCardSkeleton from "@/components/Skeletons/AdListingPublicPlanCardSkeleton";
import { getIsFreAdListing } from "@/redux/reducer/settingSlice";
import { useNavigate } from "@/components/Common/useNavigate";

const Subscription = () => {
  const isRTL = useSelector(getIsRtl);
  const { navigate } = useNavigate();
  const CurrentLanguage = useSelector(CurrentLanguageData);

  const [listingPackages, setListingPackages] = useState([]);
  const hasListingDiscount = listingPackages?.some(
    (p) => p?.discount_in_percentage > 0
  );
  const [isListingPackagesLoading, setIsListingPackagesLoading] =
    useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);

  const [adPackages, setAdPackages] = useState([]);
  const hasAdDiscount = adPackages.some((p) => p.discount_in_percentage > 0);
  const [isAdPackagesLoading, setIsAdPackagesLoading] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [packageSettings, setPackageSettings] = useState(null);
  const isLoggedIn = useSelector(getIsLoggedIn);
  const isFreeAdListing = useSelector(getIsFreAdListing);

  const [membershipPlans, setMembershipPlans] = useState([]);
  const [isMembershipPlansLoading, setIsMembershipPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!isFreeAdListing) {
      handleFetchListingPackages();
    }
    handleFetchFeaturedPackages();
  }, [CurrentLanguage?.id]);
  useEffect(() => {
    handleFetchMembershipPlans();
  }, []);
  useEffect(() => {
    if (showPaymentModal) {
      handleFetchPaymentSetting();
    }
  }, [showPaymentModal]);

  const handleFetchPaymentSetting = async () => {
    setIsLoading(true);
    try {
      const res = await getPaymentSettingsApi.getPaymentSettings();
      const { data } = res.data;
      setPackageSettings(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchListingPackages = async () => {
    try {
      setIsListingPackagesLoading(true);
      const res = await getPackageApi.getPackage({ type: "item_listing" });
      setListingPackages(res?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsListingPackagesLoading(false);
    }
  };

  const handleFetchFeaturedPackages = async () => {
    try {
      setIsAdPackagesLoading(true);
      const res = await getPackageApi.getPackage({ type: "advertisement" });
      setAdPackages(res.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdPackagesLoading(false);
    }
  };

  const handleFetchMembershipPlans = async () => {
    try {
      console.log("handleFetchMembershipPlans");
      setIsMembershipPlansLoading(true);
      const res = await membershipPlansApi.getPlans();
      if (res?.data?.error === false) {
        setMembershipPlans(res.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsMembershipPlansLoading(false);
    }
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
    // You can add purchase logic here if needed
  };

  const handlePurchasePackage = (pckg) => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    if (pckg?.final_price === 0) {
      assignPackage(pckg.id);
    } else {
      setShowPaymentModal(true);
      setSelectedPackage(pckg);
    }
  };

  const assignPackage = async (id) => {
    try {
      const res = await assigFreePackageApi.assignFreePackage({
        package_id: id,
      });
      const data = res?.data;
      if (data?.error === false) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(data.message);
      console.log(error);
    }
  };

  return (
    <Layout>
      <BreadCrumb title2={t("subscription")} />
      <div className="container">
        {isListingPackagesLoading ? (
          <AdListingPublicPlanCardSkeleton />
        ) : (
          listingPackages?.length > 0 && (
            <div className="flex flex-col gap-4 mt-8">
              <h1 className="text-2xl font-medium">{t("adListingPlan")}</h1>
              <div className="relative">
                <Carousel
                  key={isRTL ? "rtl" : "ltr"}
                  opts={{
                    align: "start",
                    containScroll: "trim",
                    direction: isRTL ? "rtl" : "ltr",
                  }}
                >
                  <CarouselPrevious className="hidden md:flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                  <CarouselNext className="hidden md:flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                  <CarouselContent
                    className={`sm:gap-4 ${hasListingDiscount ? "pt-6" : ""}`}
                  >
                    {listingPackages?.map((pckg) => (
                      <CarouselItem
                        key={pckg.id}
                        className="basis-[90%] sm:basis-[75%] md:basis-[55%] lg:basis-[45%] xl:basis-[35%] 2xl:basis-[30%]"
                      >
                        <AddListingPlanCard
                          pckg={pckg}
                          handlePurchasePackage={handlePurchasePackage}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          )
        )}

        {isAdPackagesLoading ? (
          <AdListingPublicPlanCardSkeleton />
        ) : (
          <div className="flex flex-col gap-4 mt-8">
            <h1 className="text-2xl font-medium">{t("featuredAdPlan")}</h1>
            <div className="relative">
              <Carousel
                key={isRTL ? "rtl" : "ltr"}
                opts={{
                  align: "start",
                  containScroll: "trim",
                  direction: isRTL ? "rtl" : "ltr",
                }}
                className="w-full"
              >
                <CarouselPrevious className="hidden md:flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                <CarouselNext className="hidden md:flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                <CarouselContent
                  className={`sm:gap-4 ${hasAdDiscount ? "pt-6" : ""}`}
                >
                  {adPackages?.map((pckg) => (
                    <CarouselItem
                      key={pckg.id}
                      className="basis-[90%] sm:basis-[75%] md:basis-[55%] lg:basis-[45%] xl:basis-[35%] 2xl:basis-[30%]"
                    >
                      <AddListingPlanCard
                        pckg={pckg}
                        handlePurchasePackage={handlePurchasePackage}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        )}

        {/* Membership Plans Section */}
        {isMembershipPlansLoading ? (
          <AdListingPublicPlanCardSkeleton />
        ) : (
          <div className="flex flex-col gap-4 mt-8 mb-8">
            <h1 className="text-2xl font-medium">Seller Membership Plans</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all relative box-border border-0 shadow-lg bg-blue-50 ${selectedPlan === "monthly" ? "border-primary border-2" : ""}`}
                onClick={() => handleSelectPlan("monthly")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Monthly Package
                  </CardTitle>
                  <CardDescription>
                    <span className="text-blue-500 text-2xl">$29</span>
                    /month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ FREE 15 days</li>
                    <li>✓ Billed monthly</li>
                    <li>✓ 2 Patents posted</li>
                    <li>✓ Full details of the Patent</li>
                    <li>✓ Images on posting</li>
                  </ul>
                </CardContent>
                {selectedPlan === "monthly" ? (
                  <CheckCircle2 className="text-primary absolute top-2 right-2" />
                ) : (
                  <Circle className="text-gray-500 absolute top-2 right-2 " />
                )}
              </Card>
              <Card
                className={`cursor-pointer transition-all relative bg-green-50 box-border border-0 shadow-lg ${selectedPlan === "yearly" ? "border-primary border-2" : ""}`}
                onClick={() => handleSelectPlan("yearly")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Annual Package
                  </CardTitle>
                  <CardDescription>
                    <span className="text-blue-500 text-2xl">$199</span>
                    /annual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ FREE 15 days</li>
                    <li>✓ Billed one time</li>
                    <li>✓ 2 Patents posted</li>
                    <li>✓ Full details of the Patent</li>
                    <li>✓ Images on posting</li>
                    <li>✓ PDF documents in the posting</li>
                  </ul>
                </CardContent>
                {selectedPlan === "yearly" ? (
                  <CheckCircle2 className="text-primary absolute top-2 right-2" />
                ) : (
                  <Circle className="text-gray-500 absolute top-2 right-2 " />
                )}
              </Card>
              <Card
                className={`cursor-pointer transition-all relative bg-purple-50 box-border border-0 shadow-lg ${selectedPlan === "custom" ? "border-primary border-2" : ""}`}
                onClick={() => handleSelectPlan("custom")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Custom Package
                  </CardTitle>
                  <CardDescription>
                    <span className="text-blue-500 text-2xl">$79</span>
                    /month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ FREE 15 days</li>
                    <li>✓ Billed monthly</li>
                    <li>✓ Up to 10 Patents posted</li>
                    <li>✓ Full details of the Patent</li>
                    <li>✓ Images on posting</li>
                    <li>✓ PDF documents in the posting</li>
                    <li>✓ FREE 2D/3D Rendering</li>
                  </ul>
                </CardContent>
                {selectedPlan === "custom" ? (
                  <CheckCircle2 className="text-primary absolute top-2 right-2" />
                ) : (
                  <Circle className="text-gray-500 absolute top-2 right-2 " />
                )}
              </Card>
            </div>
          </div>
        )}

        <PaymentModal
          showPaymentModal={showPaymentModal}
          setShowPaymentModal={setShowPaymentModal}
          selectedPackage={selectedPackage}
          setListingPackages={setListingPackages}
          setAdPackages={setAdPackages}
          packageSettings={packageSettings}
          isLoading={isLoading}
        />
        <BankDetailsModal
          packageId={selectedPackage?.id}
          bankDetails={packageSettings?.bankTransfer}
        />
      </div>
    </Layout>
  );
};

export default Subscription;
