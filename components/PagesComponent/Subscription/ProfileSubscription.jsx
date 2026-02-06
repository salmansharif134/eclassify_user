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
import { toast } from "sonner";
import { sellerOrderApi } from "@/utils/api";
import StripePayment from "./StripePayment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [clientSecret, setClientSecret] = useState("");
  const [paymentTransactionId, setPaymentTransactionId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

  useEffect(() => {
    handleFetchMembershipPlans();
    handleFetchDashboard();
  }, []);

  useEffect(() => {
    if (showPaymentModal) {
      handleFetchPaymentSetting();
    }
  }, [showPaymentModal]);

  useEffect(() => {
    if (showPaymentModal && packageSettings && selectedPlan && !clientSecret && !isProcessingPayment) {
      handleInitialPaymentIntent();
    }
  }, [showPaymentModal, packageSettings, selectedPlan, clientSecret, isProcessingPayment]);

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

  const mapPlanToPackage = (planKey, plans) => {
    if (!plans?.length) return null;
    const targetType =
      planKey === "monthly"
        ? "monthly"
        : planKey === "yearly"
          ? "yearly"
          : "custom";

    let plan =
      plans.find((p) => (p?.type || "").toLowerCase() === targetType) || null;

    if (!plan) {
      const sorted = [...plans].sort(
        (a, b) => Number(a?.price || 0) - Number(b?.price || 0),
      );
      if (planKey === "monthly") plan = sorted[0];
      else if (planKey === "yearly") plan = sorted[sorted.length - 1];
      else plan = sorted.find((p) => Number(p?.price) === 79) || sorted[1];
    }

    if (!plan) return null;

    return {
      ...plan,
      final_price: Number(
        plan.price ??
        (planKey === "monthly" ? 29 : planKey === "yearly" ? 199 : 79),
      ),
    };
  };

  const handleInitialPaymentIntent = async () => {
    try {
      setIsProcessingPayment(true);
      const rawPaymentMethod = packageSettings?.Stripe?.payment_method;
      const paymentMethod = rawPaymentMethod
        ? rawPaymentMethod.toLowerCase() === "stripe"
          ? "Stripe"
          : rawPaymentMethod
        : "Stripe";

      const res = await sellerOrderApi.createPaymentIntent({
        membership_plan: selectedPlan,
        selected_services: {},
        payment_method: paymentMethod,
        seller_id: userData?.seller_id || userData?.id || userData?.data?.id,
        user_id: userData?.id || userData?.data?.id,
      });

      if (res?.data?.error === false) {
        const paymentIntentData = res.data.data?.payment_intent;
        const gatewayResponse =
          paymentIntentData?.payment_gateway_response ||
          paymentIntentData?.paymentGatewayResponse ||
          res.data.data?.payment_gateway_response;
        const secret =
          gatewayResponse?.client_secret ||
          paymentIntentData?.client_secret ||
          res.data.data?.client_secret;

        const transactionId =
          paymentIntentData?.metadata?.payment_transaction_id ||
          paymentIntentData?.payment_transaction_id ||
          paymentIntentData?.transaction_id ||
          gatewayResponse?.payment_transaction_id ||
          gatewayResponse?.transaction_id ||
          res.data.data?.payment_transaction_id ||
          res.data.data?.transaction_id ||
          res.data?.payment_transaction_id ||
          res.data?.transaction_id;

        if (secret) {
          setClientSecret(secret);
          setPaymentTransactionId(transactionId);
        } else {
          toast.error("Failed to initialize payment: No client secret");
        }
      } else {
        toast.error(res?.data?.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment initialization failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    toast.success("Payment successful! Subscription updated.");
    setShowPaymentModal(false);
    setClientSecret("");
    // Optionally refresh dashboard/plans
    handleFetchDashboard();
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
    const planDetails = mapPlanToPackage(planKey, membershipPlans);
    if (planDetails) {
      setSelectedPlanDetails(planDetails);
      setClientSecret(""); // Reset previous secret
      setShowPaymentModal(true);
    } else {
      toast.error("Plan details not found. Please try again later.");
    }
  };

  return (
    <>
      {/* Membership Plans Section */}
      {isMembershipPlansLoading ? (
        <AddListingPlanCardSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
              <div className="px-3 py-4">
                <Button className="w-full " >
                  Select Plan
                </Button>
              </div>
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
              <div className="px-3 py-4">
                <Button className="w-full " >
                  Select Plan
                </Button>
              </div>
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
              <div className="px-3 py-4 ">
                <Button className="w-full " >
                  Select Plan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Subscription Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isProcessingPayment ? (
              <div className="flex justify-center p-4">Initializing Payment...</div>
            ) : clientSecret && packageSettings ? (
              <StripePayment
                selectedPackage={selectedPlanDetails}
                packageSettings={packageSettings}
                PaymentModalClose={() => setShowPaymentModal(false)}
                setShowStripePayment={() => { }}
                updateActivePackage={() => { }}
                clientSecretOverride={clientSecret}
                onPaymentSuccess={handlePaymentSuccess}
                amountDue={selectedPlanDetails?.final_price}
                billingDetails={{
                  name: userData?.name || userData?.email,
                  email: userData?.email
                }}
              />
            ) : (
              <div className="text-center p-4">Loading payment details...</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileSubscription;
