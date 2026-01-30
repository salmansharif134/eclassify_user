"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  authApi,
  membershipPlansApi,
  getPaymentSettingsApi,
  patentLookupApi,
  sellerSignupApi,
  sellerOrderApi,
} from "@/utils/api";
import D2D3 from '@/public/assets/Gemini_Generated_Image_4fdka74fdka74fdk.png'
import { useSelector } from "react-redux";
import { getIsLoggedIn, loadUpdateData, userSignUpData } from "@/redux/reducer/authSlice";
import CustomLink from "@/components/Common/CustomLink";
import StripePayment from "@/components/PagesComponent/Subscription/StripePayment";
import { useNavigate } from "@/components/Common/useNavigate";
import LoginWithEmailForm from "@/components/Auth/LoginWithEmailForm";
import Image from "next/image";
import good from '@/public/assets/good.png'
import better from '@/public/assets/better.png'
import best from '@/public/assets/best.png'
import { Circle } from "lucide-react";
import PitchDeck from '@/public/assets/PitchDeck.png'
import Paperwork from '@/public/assets/paperwork.png'
const SellerSignupWizard = ({ onComplete }) => {
  const { navigate } = useNavigate();
  const [currentStep, setCurrentStep] = useState(4);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = useSelector(getIsLoggedIn);
  const userData = useSelector(userSignUpData);
  const hasSellerAccount = Boolean(
    userData?.seller_id ||
      userData?.seller?.id ||
      userData?.is_seller === 1 ||
      userData?.is_seller === true
  );

  useEffect(() => {
    // Only redirect if user already has a seller account
    // Don't redirect logged-in users without seller accounts - they can sign up as sellers
    if (hasSellerAccount) {
      navigate("/seller-dashboard");
    }
    // Explicitly ensure we don't redirect to login - this is a signup page
  }, [hasSellerAccount, navigate]);

  // Account creation
  const [accountState, setAccountState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isCreating: false,
    isCreated: false,
  });

  // Account creation errors
  const [accountErrors, setAccountErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Step 1: Patent Status
  const [hasPatent, setHasPatent] = useState(null);
  const [patentNumber, setPatentNumber] = useState("US92726905");
  
  // Step 2: Patent Data
  const [patentData, setPatentData] = useState(null);
  const [manualPatentData, setManualPatentData] = useState({
    title: "",
    inventors: [{ first_name: "", last_name: "" }],
    assignee: "",
    filing_date: "",
    issue_date: "",
    abstract: "",
    claims: "",
    description: "",
  });
  
  // Step 3: Images
  const [patentImages, setPatentImages] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  
  // Step 4: Membership Plan
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [listingPackages, setListingPackages] = useState([]); // membership plans from API
  const [packageSettings, setPackageSettings] = useState(null);
  const [isPackagesLoading, setIsPackagesLoading] = useState(false);
  const [isPaymentSettingsLoading, setIsPaymentSettingsLoading] = useState(false);
  
  // Step 5: Additional Services
  const [selectedServices, setSelectedServices] = useState({
    drawing2D3D: false,
    evaluation: null, // 'good', 'better', 'best'
    pitchDeck: false,
    attorneySupport: false,
  });
  
  // Step 6: Cart Summary
  const [cartTotal, setCartTotal] = useState(0);
  const [orderSummary, setOrderSummary] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentTransactionId, setPaymentTransactionId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isOrderSummaryLoading, setIsOrderSummaryLoading] = useState(false);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentInitError, setPaymentInitError] = useState("");

  const handlePatentLookup = async () => {
    if (!patentNumber.trim()) {
      toast.error("Please enter a patent number");
      return;
    }
    setLoading(true);
    try {
      const response = await patentLookupApi.lookup({ patent_number: patentNumber });
      if (response.data.error === false && response.data.data) {
        let { issue_date, filing_date } = response.data.data;
        // Format dates safely if they exist
        if (issue_date) {
             issue_date = new Date(issue_date).toISOString().split('T')[0];
        }
        if (filing_date) {
            filing_date = new Date(filing_date).toISOString().split('T')[0];
        }
        
        setPatentData({...response.data.data, issue_date, filing_date});
        setCurrentStep(2);
        toast.success("Patent found! Data auto-populated.");
      } else {
        toast.info("Patent not found. Please enter manually.");
        setCurrentStep(2); // Manual entry
      }
    } catch (error) {
      console.error("Patent lookup error:", error);
      toast.error("Failed to lookup patent. Please enter manually.");
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (files, type) => {
    const fileArray = Array.from(files);
    if (type === "patent") {
      setPatentImages([...patentImages, ...fileArray]);
    } else {
      setAdditionalImages([...additionalImages, ...fileArray]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedPlan === "monthly") total += 29;
    if (selectedPlan === "yearly") total += 199;
    if (selectedServices.drawing2D3D) total += 20;
    if (selectedServices.evaluation === "good") total += 250;
    if (selectedServices.evaluation === "better") total += 500;
    if (selectedServices.evaluation === "best") total += 1999;
    if (selectedServices.pitchDeck) total += 0; // Price TBD
    if (selectedServices.attorneySupport) total += 0; // Price TBD
    return total;
  };

  const buildSelectedServicesPayload = () => ({
    drawing2D3D: Boolean(selectedServices.drawing2D3D),
    pitchDeck: Boolean(selectedServices.pitchDeck),
    attorneySupport: Boolean(selectedServices.attorneySupport),
    evaluation: selectedServices.evaluation ?? null,
  });

  const formatValidationError = (data) => {
    if (!data) return null;
    const message = data?.message;
    const errors = data?.errors || data?.data?.errors;
    if (errors && typeof errors === "object") {
      const firstError = Object.values(errors).flat()?.[0];
      return firstError || message;
    }
    if (Array.isArray(errors)) {
      return errors[0] || message;
    }
    return message;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Step 1 & 2: no sign-in required
      if (hasPatent === null) {
        toast.error("Please select if you have a patent");
        return;
      }
      if (hasPatent && !patentNumber.trim()) {
        toast.error("Please enter your patent number");
        return;
      }
      if (hasPatent) {
        handlePatentLookup();
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (!patentData) {
        const { title, inventors, assignee, filing_date, issue_date, abstract } = manualPatentData;
        if (!title?.trim()) {
          toast.error("Please enter Patent Title");
          return;
        }
        const hasInventor = Array.isArray(inventors) && inventors.some(
          (inv) => (inv?.first_name?.trim() || inv?.last_name?.trim())
        );
        if (!hasInventor) {
          toast.error("Please enter at least one inventor (First and Last name)");
          return;
        }
        if (!assignee?.trim()) {
          toast.error("Please enter Assignee");
          return;
        }
        if (!filing_date?.trim()) {
          toast.error("Please enter Filing Date");
          return;
        }
        if (!issue_date?.trim()) {
          toast.error("Please enter Issue Date");
          return;
        }
        if (!abstract?.trim()) {
          toast.error("Please enter Abstract (Summary of patent)");
          return;
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (patentImages.length === 0) {
        toast.error("Please upload at least one patent image");
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Step 4: Additional Services – sign-in required
      if (!isLoggedIn && !accountState.isCreated) {
        toast.error("Please sign in or sign up to continue");
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Step 5: Membership plan required
      if (!selectedPlan) {
        toast.error("Please select a membership plan");
        return;
      }
      setCartTotal(calculateTotal());
      setCurrentStep(6);
    } else if (currentStep === 6) {
      // Step 6: What happens next – continue to payment
      setCurrentStep(7);
    } else if (currentStep === 7) {
      if (showPaymentForm || clientSecret) return;
      if (!packageSettings) {
        toast.error("Payment settings are unavailable right now.");
        return;
      }
      handleCreatePaymentIntent();
    }
  };

  const handleSelectPlan = (planKey) => {
    const planPackage = planKey === "monthly" ? planPackages.monthly : planPackages.yearly;
    setSelectedPlan(planKey);
    setSelectedPackage(planPackage || null);
  };

  const handleSubmit = async ({
    paymentIntentId,
    paymentTransactionId: transactionId,
  } = {}) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const userId = userData?.id || userData?.data?.id;
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }
      formData.append("user_id", userId);
      
      // Append patent data
      if (patentData) {
        formData.append("has_patent", "true");
        formData.append("patent_number", patentNumber);
        formData.append("patent_data", JSON.stringify(patentData));
      } else {
        formData.append("has_patent", "false");
        formData.append("patent_data", JSON.stringify(manualPatentData));
      }
      
      // Append images
      patentImages.forEach((img, idx) => {
        formData.append(`patent_images[${idx}]`, img);
      });
      additionalImages.forEach((img, idx) => {
        formData.append(`additional_images[${idx}]`, img);
      });
      
      // Append membership plan
      formData.append("membership_plan", orderSummary?.membership_plan || selectedPlan);
      
      // Append services
      formData.append(
        "selected_services",
        JSON.stringify(buildSelectedServicesPayload())
      );

      if (paymentIntentId) {
        formData.append("payment_intent_id", paymentIntentId);
      }
      if (transactionId) {
        formData.append("payment_transaction_id", String(transactionId));
      }
      
      const response = await sellerSignupApi.submit(formData);
      
      if (response.data.error === false || response.data.error === "false") {
        toast.success("Account created successfully! Redirecting to dashboard...");
        if (onComplete) onComplete();
      } else {
        toast.error(
          response.data.message ||
            (response.data ? JSON.stringify(response.data) : null) ||
            "Failed to create account. Please try again."
        );
      }
    } catch (error) {
      const serverMessage =
        formatValidationError(error?.response?.data) ||
        (error?.response?.data ? JSON.stringify(error.response.data) : null);
      console.error("Signup error:", error?.response || error);
      toast.error(serverMessage || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Map selected plan key ("monthly" | "yearly") to a membership plan from API.
  // We treat membership plans as "packages" by adding a synthetic final_price field.
  const mapPlanToPackage = (planKey, plans) => {
    if (!plans?.length) return null;
    const targetType = planKey === "monthly" ? "monthly" : "yearly";

    // Prefer matching by type if backend uses 'monthly'/'yearly' types
    let plan =
      plans.find((p) => (p?.type || "").toLowerCase() === targetType) || null;

    // Fallback: choose first or last plan by price
    if (!plan) {
      const sorted = [...plans].sort(
        (a, b) => Number(a?.price || 0) - Number(b?.price || 0)
      );
      plan = planKey === "monthly" ? sorted[0] : sorted[sorted.length - 1];
    }

    if (!plan) return null;

    return {
      ...plan,
      // Keep compatibility with existing Stripe/payment UI that expects final_price
      final_price: Number(plan.price ?? (planKey === "monthly" ? 29 : 199)),
    };
  };

  const planPackages = useMemo(() => {
    return {
      monthly: mapPlanToPackage("monthly", listingPackages),
      yearly: mapPlanToPackage("yearly", listingPackages),
    };
  }, [listingPackages]);

  useEffect(() => {
    if (!selectedPlan) return;
    const nextPackage =
      selectedPlan === "monthly" ? planPackages.monthly : planPackages.yearly;
    if (nextPackage && nextPackage !== selectedPackage) {
      setSelectedPackage(nextPackage);
    }
  }, [selectedPlan, planPackages, selectedPackage]);

  // Load membership plans from MustangIP backend for Step 4
  useEffect(() => {
    const fetchMembershipPlans = async () => {
      try {
        setIsPackagesLoading(true);
        const res = await membershipPlansApi.getPlans();
        console.log("Membership plans API response:", res?.data);
        if (res?.data?.error === false && Array.isArray(res?.data?.data)) {
          setListingPackages(res.data.data);
        } else if (Array.isArray(res?.data)) {
          // Some APIs return plain array as data
          setListingPackages(res.data);
        } else {
          console.warn(
            "Membership plans API returned error or no data:",
            res?.data
          );
          setListingPackages([]);
        }
      } catch (error) {
        console.error("Failed to fetch membership plans:", error);
        console.error("Membership plans error details:", {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          config: {
            url: error?.config?.url,
            baseURL: error?.config?.baseURL,
            method: error?.config?.method,
          },
        });
        setListingPackages([]);
      } finally {
        setIsPackagesLoading(false);
      }
    };
    fetchMembershipPlans();
  }, []);

  useEffect(() => {
    if (currentStep !== 7 || packageSettings) return;
    const fetchPaymentSettings = async () => {
      try {
        setIsPaymentSettingsLoading(true);
        const res = await getPaymentSettingsApi.getPaymentSettings();
        setPackageSettings(res?.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch payment settings:", error);
      } finally {
        setIsPaymentSettingsLoading(false);
      }
    };
    fetchPaymentSettings();
  }, [currentStep, packageSettings]);

  useEffect(() => {
    if (currentStep !== 7 || !selectedPlan) return;
    const fetchOrderSummary = async () => {
      try {
        setIsOrderSummaryLoading(true);
        const res = await sellerOrderApi.calculateOrderTotal({
          membership_plan: selectedPlan,
          selected_services: buildSelectedServicesPayload(),
        });
        if (res?.data?.error === false) {
          setOrderSummary(res.data.data);
          if (typeof res.data.data?.total_amount === "number") {
            setCartTotal(res.data.data.total_amount);
          }
        } else {
          setOrderSummary(null);
        }
      } catch (error) {
        console.error("Failed to calculate order total:", error);
        setOrderSummary(null);
      } finally {
        setIsOrderSummaryLoading(false);
      }
    };
    fetchOrderSummary();
  }, [currentStep, selectedPlan, selectedServices]);

  const handleCreatePaymentIntent = async () => {
    try {
      setIsCreatingPaymentIntent(true);
      setPaymentInitError("");
      const membershipPlan = orderSummary?.membership_plan || selectedPlan;
      if (!membershipPlan) {
        setPaymentInitError(
          "Membership plan is missing. Please go back and select a plan."
        );
        return;
      }
      const rawPaymentMethod = packageSettings?.Stripe?.payment_method;
      const paymentMethod = rawPaymentMethod
        ? rawPaymentMethod.toLowerCase() === "stripe"
          ? "Stripe"
          : rawPaymentMethod
        : "Stripe";
      const res = await sellerOrderApi.createPaymentIntent({
        membership_plan: membershipPlan,
        selected_services: buildSelectedServicesPayload(),
        payment_method: paymentMethod,
      });
      console.log("Create payment intent response:", res?.data);
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
          paymentIntentData?.payment_transaction_id ||
          paymentIntentData?.transaction_id ||
          res.data.data?.payment_transaction_id ||
          res.data.data?.transaction_id;
        if (res.data.data?.order_summary) {
          setOrderSummary(res.data.data.order_summary);
        }
        if (!secret) {
          setPaymentInitError(
            "Payment intent created, but client secret is missing."
          );
          return;
        }
        setClientSecret(secret);
        setPaymentTransactionId(transactionId || null);
        setShowPaymentForm(true);
      } else {
        const fallback =
          res?.data ? JSON.stringify(res.data) : "Failed to initialize payment.";
        setPaymentInitError(
          formatValidationError(res?.data) || fallback
        );
      }
    } catch (error) {
      console.error("Payment intent error:", error);
      const fallback =
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to initialize payment.";
      setPaymentInitError(
        formatValidationError(error?.response?.data) || fallback
      );
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    const transactionId =
      paymentIntent?.metadata?.payment_transaction_id ||
      paymentIntent?.metadata?.transaction_id ||
      paymentTransactionId;
    if (!transactionId) {
      toast.error(
        "Missing payment transaction ID. Please retry payment creation."
      );
      return;
    }
    handleSubmit({
      paymentIntentId: paymentIntent?.id,
      paymentTransactionId: transactionId,
    });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let hasErrors = false;

    if (!accountState.name.trim()) {
      newErrors.name = "Please enter your name";
      hasErrors = true;
    }
    if (!accountState.email.trim()) {
      newErrors.email = "Please enter your email";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(accountState.email)) {
      newErrors.email = "Please enter a valid email";
      hasErrors = true;
    }
    if (!accountState.password) {
      newErrors.password = "Please enter a password";
      hasErrors = true;
    } else if (accountState.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasErrors = true;
    }
    if (accountState.password !== accountState.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    setAccountErrors(newErrors);

    if (hasErrors) {
      const firstError = Object.values(newErrors).find((error) => error);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    const persistAuthData = (authData) => {
      if (authData?.token) {
        localStorage.setItem("token", authData.token);
      }
      loadUpdateData(authData);
    };

    try {
      setAccountState((prev) => ({ ...prev, isCreating: true }));
      const response = await authApi.register({
        name: accountState.name,
        email: accountState.email,
        password: accountState.password,
      });
      const data = response?.data;
      if (data?.error === false || data?.error === "false") {
        if (data?.token) {
          persistAuthData(data);
          toast.success(data.message || "Account created");
          setAccountState((prev) => ({ ...prev, isCreated: true }));
          return;
        }

        // Fallback: login to obtain token for payment-required APIs.
        const loginResponse = await authApi.login({
          email: accountState.email,
          password: accountState.password,
        });
        const loginData = loginResponse?.data;
        if (loginData?.error === false || loginData?.error === "false") {
          persistAuthData(loginData);
          toast.success(loginData.message || "Account created");
          setAccountState((prev) => ({ ...prev, isCreated: true }));
        } else {
          toast.error(
            loginData?.message ||
              "Account created, but login failed. Please log in to continue."
          );
        }
      } else {
        // Handle server-side validation errors
        if (error?.response?.data?.errors) {
          const serverErrors = error.response.data.errors;
          const updatedErrors = { ...accountErrors };
          
          if (serverErrors.name) {
            updatedErrors.name = Array.isArray(serverErrors.name) 
              ? serverErrors.name[0] 
              : serverErrors.name;
          }
          if (serverErrors.email) {
            updatedErrors.email = Array.isArray(serverErrors.email) 
              ? serverErrors.email[0] 
              : serverErrors.email;
          }
          if (serverErrors.password) {
            updatedErrors.password = Array.isArray(serverErrors.password) 
              ? serverErrors.password[0] 
              : serverErrors.password;
          }
          
          setAccountErrors(updatedErrors);
        }
        toast.error(data?.message || "Failed to create account");
      }
    } catch (error) {
      // Handle server-side validation errors
      if (error?.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const updatedErrors = { ...accountErrors };
        
        if (serverErrors.name) {
          updatedErrors.name = Array.isArray(serverErrors.name) 
            ? serverErrors.name[0] 
            : serverErrors.name;
        }
        if (serverErrors.email) {
          updatedErrors.email = Array.isArray(serverErrors.email) 
            ? serverErrors.email[0] 
            : serverErrors.email;
        }
        if (serverErrors.password) {
          updatedErrors.password = Array.isArray(serverErrors.password) 
            ? serverErrors.password[0] 
            : serverErrors.password;
        }
        
        setAccountErrors(updatedErrors);
      }
      toast.error(error?.response?.data?.message || "Failed to create account");
    } finally {
      setAccountState((prev) => ({ ...prev, isCreating: false }));
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      setAccountState((prev) => ({ ...prev, isCreating: true }));
      const response = await authApi.googleLogin({
        token: credentialResponse.credential,
      });
      const data = response?.data;
      if (data?.error === false || data?.error === "false") {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        loadUpdateData(data);
        toast.success(data.message || "Account created");
        setAccountState((prev) => ({ ...prev, isCreated: true }));
      } else {
        toast.error(data?.message || "Google login failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google login failed");
    } finally {
      setAccountState((prev) => ({ ...prev, isCreating: false }));
    }
  };
  return (
    <div className="container max-w-4xl mx-auto py-10">
      {/* Progress Steps – hide on step 6 (What happens next) per feedback R */}
      {currentStep !== 6 && (
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm ${
                  currentStep >= step
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step ? <CheckCircle2 size={18} /> : step}
              </div>
              {step < 7 && (
                <div
                  className={`flex-1 h-1 mx-1 sm:mx-2 ${
                    currentStep > step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Do you already have a patent?"}
            {currentStep === 2 && "Patent Information"}
            {currentStep === 3 && "Upload Images"}
            {currentStep === 4 && "Additional Services"}
            {currentStep === 5 && "Listing Advertising Packages"}
            {currentStep === 6 && "What happens next"}
            {currentStep === 7 && "Review Order"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Do you already have a patent? Two choices only; no "Signed in as" */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Button
                  variant={hasPatent === true ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setHasPatent(true)}
                >
                  Yes, I have a patent
                </Button>
                <Button
                  variant={hasPatent === false ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setHasPatent(false)}
                >
                  No, input data manually
                </Button>
              </div>
              {hasPatent === true && (
                <div className="space-y-2">
                  <Label htmlFor="patentNumber">USPTO Patent Number</Label>
                  <Input
                    id="patentNumber"
                    placeholder="e.g., US12345678"
                    value={patentNumber}
                    onChange={(e) => setPatentNumber(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Patent Information (Manual Entry or Review Auto-populated) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {patentData ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 mb-2">
                    ✓ Patent data found and auto-populated. You can edit if needed.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Please enter your patent information manually.
                  </p>
                </div>
              )}
              <div>
                <Label>Patent Title</Label>
                <Input
                  value={patentData?.title || manualPatentData.title}
                  onChange={(e) => {
                    if (patentData) {
                      setPatentData({ ...patentData, title: e.target.value });
                    } else {
                      setManualPatentData({ ...manualPatentData, title: e.target.value });
                    }
                  }}
                />
              </div>
              {/* Inventors: First name, Last name; + Add Inventor */}
              <div className="space-y-2">
                <Label>Inventors</Label>
                {(patentData ? [{ first_name: patentData.inventor || "", last_name: "" }] : manualPatentData.inventors).map((inv, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="Inventor First Name"
                      value={patentData ? (idx === 0 ? patentData.inventor : "") : inv.first_name}
                      onChange={(e) => {
                        if (patentData) {
                          setPatentData({ ...patentData, inventor: e.target.value });
                        } else {
                          const next = [...manualPatentData.inventors];
                          next[idx] = { ...next[idx], first_name: e.target.value };
                          setManualPatentData({ ...manualPatentData, inventors: next });
                        }
                      }}
                    />
                    <Input
                      placeholder="Inventor Last Name"
                      value={patentData ? "" : inv.last_name}
                      onChange={(e) => {
                        if (!patentData) {
                          const next = [...manualPatentData.inventors];
                          next[idx] = { ...next[idx], last_name: e.target.value };
                          setManualPatentData({ ...manualPatentData, inventors: next });
                        }
                      }}
                    />
                  </div>
                ))}
                {!patentData && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setManualPatentData({
                        ...manualPatentData,
                        inventors: [...manualPatentData.inventors, { first_name: "", last_name: "" }],
                      })
                    }
                  >
                    + Add Inventor
                  </Button>
                )}
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={patentData?.issue_date || manualPatentData.issue_date}
                  onChange={(e) => {
                    if (patentData) {
                      setPatentData({ ...patentData, issue_date: e.target.value });
                    } else {
                      setManualPatentData({ ...manualPatentData, issue_date: e.target.value });
                    }
                  }}
                />
              </div>
              <div>
                <Label>Assignee</Label>
                <Input
                  value={patentData?.assignee || manualPatentData.assignee}
                  onChange={(e) => {
                    if (patentData) {
                      setPatentData({ ...patentData, assignee: e.target.value });
                    } else {
                      setManualPatentData({ ...manualPatentData, assignee: e.target.value });
                    }
                  }}
                />
              </div>
              <div>
                <Label>Filing Date</Label>
                <Input
                  type="date"
                  value={patentData?.filing_date || manualPatentData.filing_date}
                  onChange={(e) => {
                    if (patentData) {
                      setPatentData({ ...patentData, filing_date: e.target.value });
                    } else {
                      setManualPatentData({ ...manualPatentData, filing_date: e.target.value });
                    }
                  }}
                />
              </div>
              <div>
                <Label>Abstract (Summary of patent)</Label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={patentData?.abstract || manualPatentData.abstract}
                  onChange={(e) => {
                    if (patentData) {
                      setPatentData({ ...patentData, abstract: e.target.value });
                    } else {
                      setManualPatentData({ ...manualPatentData, abstract: e.target.value });
                    }
                  }}
                />
              </div>
              {/* Claims & Description hidden for now */}
            </div>
          )}

          {/* Step 3: Image Upload (no sign-in required) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Patent Images (Required)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="mb-2">Upload patent images</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, "patent")}
                    className="max-w-xs mx-auto"
                  />
                </div>
                {patentImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {patentImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Patent ${idx + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label>Additional Images (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="mb-2">Upload additional images</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, "additional")}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Services first (N); sign-in required; image on side (N2, O) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold -mt-4 text-gray-500">
                Please select the services you want to avail
              </p>
              {!isLoggedIn && !accountState.isCreated ? (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <LoginWithEmailForm 
                    OnHide={() => setAccountState((prev) => ({ ...prev, isCreated: true }))} 
                  />
                  <div className="text-sm text-center">
                    Don&apos;t have an account?{" "}
                    <CustomLink href="/buyer-signup" className="text-primary underline">
                      Sign Up
                    </CustomLink>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="col-span-4 space-y-4">
              <Card
                className={`cursor-pointer flex items-stretch gap-2 relative shadow-xl transition-all ${
                  selectedServices.drawing2D3D ? "border-primary border-2" : "border-0"
                }`}
                onClick={() =>
                  setSelectedServices({ ...selectedServices, drawing2D3D: !selectedServices.drawing2D3D })
                }
              >
                <CardHeader className="p-0 relative aspect-[1/] flex-shrink-0 ">
                    <Image src={D2D3} alt="2D/3D Drawing of Your Idea" height={150} width={300} className="object-cover rounded-l-lg " />
                </CardHeader>
                <CardContent >
                  <CardTitle className="flex items-center justify-between pt-3">
                    2D/3D Drawing of Your Idea
                  </CardTitle>
                  <CardDescription>$20</CardDescription>
                  <p className="text-sm text-muted-foreground mb-2">
                    Professional visualization of your patent idea
                  </p>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </CardContent>
                    {selectedServices.drawing2D3D ? 
                  <CheckCircle2 className="text-primary absolute top-2 right-2" />
                  :
                  <Circle  className="text-gray-500 absolute top-2 right-2" />
                  }
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patent Evaluation by Expert</CardTitle>
                  <CardDescription>Starting at $250</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div
                    className={`p-3 shadow-lg rounded-lg cursor-pointer relative ${
                      selectedServices.evaluation === "good" ? "border border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedServices({ ...selectedServices, evaluation: "good" })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Image src={good} alt="good" className="w-full" width={50} height={50} />
                        <p className="font-medium">Good - Basic Evaluation</p>
                        <p className="text-sm text-muted-foreground">$250 • 2 pages</p>
                      </div>
                      {selectedServices.evaluation === "good" ? (
                        <CheckCircle2 className="text-primary absolute top-2 right-2" />
                      ):<Circle  className="text-gray-500 absolute top-2 right-2" />}
                    </div>
                  </div>
                  <div
                    className={`p-3 shadow-lg rounded-lg cursor-pointer relative ${
                      selectedServices.evaluation === "better" ? "border border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedServices({ ...selectedServices, evaluation: "better" })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Image src={better} alt="better" className="w-full" width={50} height={50} />
                        <p className="font-medium">Better - Comprehensive</p>
                        <p className="text-sm text-muted-foreground">$500 • 6-20 pages</p>
                      </div>
                 {selectedServices.evaluation === "better" ? (
                        <CheckCircle2 className="text-primary absolute top-2 right-2" />
                      ):<Circle  className="text-gray-500 absolute top-2 right-2" />}
                    </div>
                  </div>
                  <div
                    className={`p-3 shadow-lg rounded-lg cursor-pointer relative ${
                      selectedServices.evaluation === "best" ? "border border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedServices({ ...selectedServices, evaluation: "best" })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div> 
                        <Image src={best} alt="best" className="w-full" width={50} height={50} />
                        <p className="font-medium">Best - Detailed Report</p>
                        <p className="text-sm text-muted-foreground">$1,999 • 15-30 pages</p>
                      </div>
                   {selectedServices.evaluation === "best" ? (
                        <CheckCircle2 className="text-primary absolute top-2 right-2" />
                      ):<Circle  className="text-gray-500 absolute top-2 right-2" />}
                    </div>
                  </div>
                  </div>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer flex items-stretch gap-2 relative shadow-xl transition-all ${
                  selectedServices.pitchDeck ? "border-primary border-2" : "border-0"
                }`}
                onClick={() =>
                  setSelectedServices({ ...selectedServices, pitchDeck: !selectedServices.pitchDeck })
                }
              >
                <CardHeader className="p-0 relative aspect-[2/1] flex-shrink-0 w-[300px] ">
                   <Image src={PitchDeck} alt="Professional Pitch Deck" fill className="object-cover rounded-l-lg" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="flex items-center justify-between pt-3">
                    Professional Pitch Deck
                  </CardTitle>
                  <CardDescription>Price TBD</CardDescription>
                  <p className="text-sm text-muted-foreground mb-2">
                    Perfect for larger investors and partnerships
                  </p>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </CardContent>
                {selectedServices.pitchDeck ? (
                    <CheckCircle2 className="text-primary absolute top-2 right-2" />
                  ) : (
                    <Circle className="text-gray-500 absolute top-2 right-2" />
                  )}
              </Card>



              <Card
                className={`cursor-pointer flex items-stretch gap-2 transition-all relative shadow-xl ${
                  selectedServices.attorneySupport ? "border-primary border-2" : "border-0"
                }`}
                onClick={() =>
                  setSelectedServices({
                    ...selectedServices,
                    attorneySupport: !selectedServices.attorneySupport,
                  })
                }
              >
                <CardHeader className="p-0 relative aspect-[2/1] flex-shrink-0 w-[300px]">
                   <Image src={Paperwork} alt="Attorney Support" fill className="object-cover rounded-l-lg" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="flex items-center justify-between pt-3">
                    Attorney Support
                  </CardTitle>
                  <CardDescription>Price TBD</CardDescription>
                  <p className="text-sm text-muted-foreground mb-2">
                    Help with paperwork for the sale or investment of your patent
                  </p>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </CardContent>
                {selectedServices.attorneySupport ? (
                    <CheckCircle2 className="text-primary absolute top-2 right-2" />
                  ) : (
                    <Circle className="text-gray-500 absolute top-2 right-2" />
                  )}
              </Card>
                  </div>
            
                </div>
              )}
            </div>
          )}

          {/* Step 5: Listing Advertising Packages (monthly or annual) */}
          {currentStep === 5 && (
            <div className="space-y-4">
              {isPackagesLoading && (
                <p className="text-sm text-muted-foreground">Loading membership options...</p>
              )}
              <Card
                className={`cursor-pointer transition-all ${selectedPlan === "monthly" ? "border-primary border-2" : ""}`}
                onClick={() => handleSelectPlan("monthly")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Monthly Plan
                    {selectedPlan === "monthly" && <CheckCircle2 className="text-primary" />}
                  </CardTitle>
                  <CardDescription>$29/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 15-day free trial</li>
                    <li>✓ Cancel anytime</li>
                    <li>✓ List your patent</li>
                    <li>✓ Access to marketplace</li>
                  </ul>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${selectedPlan === "yearly" ? "border-primary border-2" : ""}`}
                onClick={() => handleSelectPlan("yearly")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Yearly Plan <span className="text-sm text-green-600">15% OFF</span>
                    {selectedPlan === "yearly" && <CheckCircle2 className="text-primary" />}
                  </CardTitle>
                  <CardDescription>$199/year (Save $149)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 15-day free trial</li>
                    <li>✓ Best value - 15% discount</li>
                    <li>✓ Recommended for serious sellers</li>
                    <li>✓ Meaningful partnerships or sales take time</li>
                    <li>✓ Full marketplace access</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: What happens next (R) – no status bar; circle image, 1) 2) 3), phone/email on right */}
          {currentStep === 6 && (
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-4">
                <p className="font-medium">What happens next?</p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>An account manager will be assigned to help you stay engaged.</li>
                  <li>A sales person will call to confirm everything.</li>
                  <li>You&apos;ll receive a welcome email with next steps.</li>
                </ol>
              </div>
              <div className="w-full md:w-auto flex flex-col items-center gap-2 shrink-0">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  <span className="text-muted-foreground text-xs text-center px-2">Photo</span>
                </div>
                <div className="text-center text-sm">
                  <p className="font-medium">{userData?.name || accountState?.name || "Your account manager"}</p>
                  <p>{userData?.email || accountState?.email || "—"}</p>
                  <p>{[userData?.country_code, userData?.mobile].filter(Boolean).join(" ") || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Review Order (S) – order summary, edit links, payment at bottom */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(4)}>
                  Edit Additional Services
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(5)}>
                  Edit Plan
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Membership Plan:</span>
                    <span>
                      {orderSummary?.membership_price !== undefined
                        ? `$${orderSummary.membership_price}/${
                            orderSummary?.membership_plan === "yearly"
                              ? "year"
                              : "month"
                          }`
                        : selectedPlan === "monthly"
                        ? "$29/month"
                        : "$199/year"}
                    </span>
                  </div>
                  {isOrderSummaryLoading && (
                    <div className="text-sm text-muted-foreground">
                      Calculating order total...
                    </div>
                  )}
                  {orderSummary?.services?.length > 0 ? (
                    orderSummary.services.map((service, index) => (
                      <div className="flex justify-between" key={index}>
                        <span>{service.name}:</span>
                        <span>${service.price}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      {selectedServices.drawing2D3D && (
                        <div className="flex justify-between">
                          <span>2D/3D Drawing:</span>
                          <span>$20</span>
                        </div>
                      )}
                      {selectedServices.evaluation && (
                        <div className="flex justify-between">
                          <span>Evaluation ({selectedServices.evaluation}):</span>
                          <span>
                            $
                            {selectedServices.evaluation === "good"
                              ? "250"
                              : selectedServices.evaluation === "better"
                              ? "500"
                              : "1,999"}
                          </span>
                        </div>
                      )}
                      {selectedServices.pitchDeck && (
                        <div className="flex justify-between">
                          <span>Pitch Deck:</span>
                          <span>TBD</span>
                        </div>
                      )}
                      {selectedServices.attorneySupport && (
                        <div className="flex justify-between">
                          <span>Attorney Support:</span>
                          <span>TBD</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>
                      {orderSummary?.total_amount !== undefined
                        ? `$${orderSummary.total_amount}`
                        : `$${cartTotal}`}
                    </span>
                  </div>
                </div>
              </div>
              {paymentInitError && (
                <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">
                  {paymentInitError}
                </div>
              )}
              {isCreatingPaymentIntent && (
                <div className="rounded-md bg-muted text-sm px-3 py-2">
                  Initializing payment...
                </div>
              )}
              {paymentInitError && (
                <Button variant="outline" onClick={handleCreatePaymentIntent}>
                  Retry Payment
                </Button>
              )}
              {showPaymentForm && clientSecret && (
                <div className="rounded-lg border border-muted/60 p-4 space-y-3">
                  <div className="rounded-md bg-yellow-50 text-yellow-900 text-sm px-3 py-2">
                    Payment pending. Please complete Stripe payment to finish signup.
                  </div>
                  <StripePayment
                    selectedPackage={selectedPackage}
                    packageSettings={packageSettings}
                    PaymentModalClose={() => setShowPaymentForm(false)}
                    setShowStripePayment={() => {}}
                    updateActivePackage={() => {}}
                    clientSecretOverride={clientSecret}
                    onPaymentSuccess={handlePaymentSuccess}
                    amountDue={
                      orderSummary?.total_amount !== undefined
                        ? orderSummary.total_amount
                        : cartTotal
                    }
                    billingDetails={{
                      name: userData?.name || accountState?.name,
                      email: userData?.email || accountState?.email,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStep === 7 && (isCreatingPaymentIntent || !packageSettings)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Processing...
                </>
              ) : currentStep === 7 ? (
                <>
                  {isCreatingPaymentIntent ? "Preparing Payment..." : "Complete Signup"}
                  <ArrowRight className="ml-2" size={16} />
                </>
              ) : currentStep === 6 ? (
                <>
                  Continue to Payment
                  <ArrowRight className="ml-2" size={16} />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2" size={16} />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerSignupWizard;
