"use client";
import { useEffect, useState } from "react";
import {
  getPaymentSettingsApi,
  membershipPlansApi,
  sellerApi,
} from "@/utils/api";
import { t } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import AddListingPlanCardSkeleton from "@/components/Skeletons/AddListingPlanCardSkeleton";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";

const ProfileSubscription = () => {
  const userData = useSelector(userSignUpData);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageSettings, setPackageSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const [membershipPlans, setMembershipPlans] = useState([]);
  const [isMembershipPlansLoading, setIsMembershipPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    handleFetchMembershipPlans();
    handleFetchDashboard();
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

  const handleFetchMembershipPlans = async () => {
    try {
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

  const handleFetchDashboard = async () => {
    try {
      setIsDashboardLoading(true);
      const sellerId = userData?.seller_id || userData?.id || userData?.data?.id;
      if (!sellerId) {
        console.log("No seller ID found");
        return;
      }
      const res = await sellerApi.getDashboard(sellerId);
      if (res?.data?.error === false) {
        setDashboardData(res.data?.data);
        console.log("Dashboard data:", res.data?.data);
      }
    } catch (error) {
      console.log("Error fetching dashboard:", error);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
    // You can add purchase logic here if needed
  };

  return (
    <>
      {/* Membership Plans Section */}
      {isMembershipPlansLoading ? (
        <AddListingPlanCardSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
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
    </>
  );
};

export default ProfileSubscription;
