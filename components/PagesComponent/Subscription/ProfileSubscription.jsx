"use client";
import { useEffect, useState, useMemo } from "react";
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
  const [billingPeriod, setBillingPeriod] = useState("monthly");

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
    const targetType = planKey;

    // Prefer matching by type if backend uses 'monthly'/'yearly' types
    let plan =
      plans.find((p) => (p?.type || "").toLowerCase() === targetType) || null;

    // Fallback: choose first or last plan by price
    if (!plan) {
      const sorted = [...plans].sort(
        (a, b) => Number(a?.price || 0) - Number(b?.price || 0),
      );
      if (planKey === "monthly") plan = sorted[0];
      else if (planKey === "yearly") plan = sorted[sorted.length - 1];
      else plan = sorted.find(p => Number(p?.price) === 79) || sorted[1];
    }

    if (!plan && planKey === "custom_yearly") {
      plan = plans.find(p => (p?.type || "").toLowerCase() === "custom_yearly") || plans.find(p => p?.price == 349) || null;
    }

    if (!plan) return null;

    return {
      ...plan,
      // Keep compatibility with existing Stripe/payment UI that expects final_price
      final_price: Number(
        plan.price ??
        (planKey === "monthly"
          ? 29
          : planKey === "yearly"
            ? 199
            : planKey === "custom"
              ? 79
              : 349),
      ),
    };
  };

  const planPackages = useMemo(() => {
    return {
      monthly: mapPlanToPackage("monthly", membershipPlans),
      yearly: mapPlanToPackage("yearly", membershipPlans),
      custom: mapPlanToPackage("custom", membershipPlans),
      custom_yearly: mapPlanToPackage("custom_yearly", membershipPlans),
    };
  }, [membershipPlans]);

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

  const handlePaymentSuccess = async (paymentIntent) => {
    toast.success("Payment successful! Subscription updated.");
    setShowPaymentModal(false);
    setClientSecret("");
    // Optionally refresh dashboard/plans
    handleFetchDashboard();
  };

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);

    let planDetails = null;
    if (planKey === "monthly") planDetails = planPackages.monthly;
    else if (planKey === "yearly") planDetails = planPackages.yearly;
    else if (planKey === "custom") planDetails = planPackages.custom;
    else if (planKey === "custom_yearly") planDetails = planPackages.custom_yearly;

    if (!planDetails) {
      // Fallback if useMemo hasn't updated or something
      planDetails = mapPlanToPackage(planKey, membershipPlans);
    }

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
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center gap-4 bg-muted p-1 rounded-full">
              <button
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${billingPeriod === "monthly" ? "bg-background shadow-sm" : "hover:bg-muted-foreground/10"}`}
                onClick={() => setBillingPeriod("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${billingPeriod === "yearly" ? "bg-background shadow-sm" : "hover:bg-muted-foreground/10"}`}
                onClick={() => setBillingPeriod("yearly")}
              >
                Annual
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {billingPeriod === "yearly" ? "Save up to 40% with annual billing" : "Flexible monthly billing"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Standard Tier */}
            {(() => {
              const pkg = billingPeriod === "monthly" ? planPackages.monthly : planPackages.yearly;
              if (!pkg) return null;
              const isSelected = selectedPlan === pkg.type;
              return (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-all relative box-border border-0 shadow-lg bg-blue-50/50 ${isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-xl"}`}
                  onClick={() => {
                    handleSelectPlan(pkg.type);
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl">
                      {billingPeriod === "monthly" ? "Monthly Package" : "Annual Package"}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-blue-600 text-3xl font-bold">${pkg.price}</span>
                      <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      {pkg.features?.map((f, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary font-bold">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {isSelected && (
                    <CheckCircle2 className="text-primary absolute top-4 right-4 h-6 w-6" />
                  )}
                </Card>
              );
            })()}

            {/* Custom Tier */}
            {(() => {
              const pkg = billingPeriod === "monthly" ? planPackages.custom : planPackages.custom_yearly;
              if (!pkg) return null;
              const isSelected = selectedPlan === pkg.type;
              return (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-all relative box-border border-0 shadow-lg bg-purple-50/50 ${isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-xl"}`}
                  onClick={() => {
                    handleSelectPlan(pkg.type);
                  }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Recommended
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl">
                      {billingPeriod === "monthly" ? "Custom Package" : "Custom Annual Package"}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-purple-600 text-3xl font-bold">${pkg.price}</span>
                      <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      {pkg.features?.map((f, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary font-bold">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {isSelected && (
                    <CheckCircle2 className="text-primary absolute top-4 right-4 h-6 w-6" />
                  )}
                </Card>
              );
            })()}
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
