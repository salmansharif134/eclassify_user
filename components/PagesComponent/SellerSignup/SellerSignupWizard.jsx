"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  authApi,
  membershipPlansApi,
  getPaymentSettingsApi,
  patentLookupApi,
  sellerSignupApi,
  sellerOrderApi,
  sellerDashboardApi,
  patentsApi,
} from "@/utils/api";
import D2D3 from "@/public/assets/Gemini_Generated_Image_4fdka74fdka74fdk.png";
import { useSelector } from "react-redux";
import {
  getIsLoggedIn,
  loadUpdateData,
  userSignUpData,
} from "@/redux/reducer/authSlice";
import CustomLink from "@/components/Common/CustomLink";
import StripePayment from "@/components/PagesComponent/Subscription/StripePayment";
import { useNavigate } from "@/components/Common/useNavigate";
import LoginWithEmailForm from "@/components/Auth/LoginWithEmailForm";
import Image from "next/image";
import good from "@/public/assets/good.png";
import better from "@/public/assets/better.png";
import best from "@/public/assets/best.png";
import { Circle } from "lucide-react";
import PitchDeck from "@/public/assets/PitchDeck.png";
import Paperwork from "@/public/assets/paperwork.png";
import UserAvatar from "@/public/assets/user.jpg";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ToniLexington from "@/public/assets/Toni Lexington.jpg";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const SellerSignupWizard = ({ onComplete }) => {
  const { navigate } = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = useSelector(getIsLoggedIn);
  const signUpData = useSelector(userSignUpData);
  const userData = useSelector(userSignUpData);
  const hasSellerAccount = Boolean(
    userData?.seller_id ||
    userData?.seller?.id ||
    userData?.is_seller === 1 ||
    userData?.is_seller === true,
  );
  console.log("signUpData", signUpData);
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

  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [sellerId, setSellerId] = useState(null);
  const [persistentUserId, setPersistentUserId] = useState(null);
  const [personalInfoSubmitted, setPersonalInfoSubmitted] = useState(false);

  // Account creation errors
  const [accountErrors, setAccountErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Step 1: Patent Status
  const [hasPatent, setHasPatent] = useState(null);
  const [patentNumber, setPatentNumber] = useState("");

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
    patent_class: "",
    patent_type: "",
  });

  // Step 3: Images
  const [patentImages, setPatentImages] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);

  // Step 4: Personal Info
  // Step 6: Membership Plan
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [listingPackages, setListingPackages] = useState([]); // membership plans from API
  const [packageSettings, setPackageSettings] = useState(null);
  const [isPackagesLoading, setIsPackagesLoading] = useState(false);
  const [isPaymentSettingsLoading, setIsPaymentSettingsLoading] =
    useState(false);

  // Step 5: Additional Services
  const [selectedServices, setSelectedServices] = useState({
    drawing2D3D: false,
    evaluation: null, // 'good', 'better', 'best'
    pitchDeck: false,
    attorneySupport: false,
  });

  // Step 7: Pricing
  const [pricing, setPricing] = useState({
    isAuction: false,
    auctionPrice: "",
    isListedPrice: false,
    listedPrice: "",
    allowNegotiation: false,
  });

  // Step 8: Cart Summary
  const [cartTotal, setCartTotal] = useState(0);
  const [orderSummary, setOrderSummary] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentTransactionId, setPaymentTransactionId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isOrderSummaryLoading, setIsOrderSummaryLoading] = useState(false);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentInitError, setPaymentInitError] = useState("");

  const STORAGE_KEY = "SELLER_WIZARD_STATE_V1";

  // Load state from local storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);

        // Restore step (but clamp if data missing for step? - trust the user for now)
        if (parsedState.currentStep) setCurrentStep(parsedState.currentStep);

        // Restore patent status
        if (parsedState.hasPatent !== undefined) setHasPatent(parsedState.hasPatent);
        if (parsedState.patentNumber) setPatentNumber(parsedState.patentNumber);

        // Restore patent data
        if (parsedState.patentData) setPatentData(parsedState.patentData);
        if (parsedState.manualPatentData) setManualPatentData(parsedState.manualPatentData);

        // Restore account state (careful with sensitive data)
        if (parsedState.accountState) {
          setAccountState(prev => ({
            ...prev,
            name: parsedState.accountState.name || prev.name,
            email: parsedState.accountState.email || prev.email,
            // Do not restore password
          }));
        }

        // Restore selections
        if (parsedState.selectedPlan) setSelectedPlan(parsedState.selectedPlan);
        // selectedPackage is derived from selectedPlan in an effect, so we might skip it or rely on that effect.
        // Actually, selectedPackage is state, but we have logic to set it when selectedPlan changes.

        if (parsedState.selectedServices) setSelectedServices(parsedState.selectedServices);

        if (parsedState.pricing) setPricing(parsedState.pricing);

        if (parsedState.contactInfo) setContactInfo(parsedState.contactInfo);
        if (parsedState.sellerId) setSellerId(parsedState.sellerId);
        if (parsedState.persistentUserId || parsedState.userId) setPersistentUserId(parsedState.persistentUserId || parsedState.userId);
        if (parsedState.paymentTransactionId) setPaymentTransactionId(parsedState.paymentTransactionId);
        if (parsedState.personalInfoSubmitted) setPersonalInfoSubmitted(parsedState.personalInfoSubmitted);

        // Warn about images if step is past 3 (images step)
        if (parsedState.currentStep > 3) {
          toast.info("Please re-upload your images if they are missing.", { duration: 5000 });
        }
      } catch (err) {
        console.error("Failed to parse saved wizard state:", err);
      }
    }
  }, []);

  // Save state to local storage on change
  useEffect(() => {
    const stateToSave = {
      currentStep,
      hasPatent,
      patentNumber,
      patentData,
      manualPatentData,
      selectedPlan,
      // selectedPackage: selectedPackage, // derived mostly
      selectedServices,
      pricing,
      contactInfo,
      sellerId,
      persistentUserId,
      paymentTransactionId,
      personalInfoSubmitted,
      accountState: {
        name: accountState.name,
        email: accountState.email
      },
      timestamp: Date.now()
    };

    // Simple debounce could be good, but this is fine for now
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    currentStep,
    hasPatent,
    patentNumber,
    patentData,
    manualPatentData,
    selectedPlan,
    selectedServices,
    contactInfo,
    sellerId,
    persistentUserId,
    paymentTransactionId,
    personalInfoSubmitted,
    accountState.name,
    accountState.email
  ]);

  const handlePatentLookup = async () => {
    if (!patentNumber.trim()) {
      toast.error("Please enter a patent number");
      return;
    }
    setLoading(true);
    try {
      const response = await patentLookupApi.lookup({
        patent_number: patentNumber,
      });
      if (response.data.error === false && response.data.data) {
        let { issue_date, filing_date } = response.data.data;
        // Format dates safely if they exist
        if (issue_date) {
          issue_date = new Date(issue_date).toISOString().split("T")[0];
        }
        if (filing_date) {
          filing_date = new Date(filing_date).toISOString().split("T")[0];
        }

        // Parse inventors if multiple names exist or single string
        const apiInventors = response.data.data.inventor || "";
        // Simple heuristic: split by comma if multiple, or space for first/last
        // But usually patent data might come as "Last, First" or similar. 
        // Let's assume the API returns a string "First Last" or similar.
        // We will create one inventor entry for now, splitting on the last space.

        let inventorsList = [];
        if (apiInventors) {
          inventorsList.push({ first_name: apiInventors, last_name: "" });
        } else {
          inventorsList.push({ first_name: "", last_name: "" });
        }

        setPatentData({ ...response.data.data, issue_date, filing_date });
        // Hydrate manual form for editing
        setManualPatentData({
          title: response.data.data.title || "",
          inventors: inventorsList,
          assignee: response.data.data.assignee || "",
          filing_date: filing_date || "",
          issue_date: issue_date || "",
          abstract: response.data.data.abstract || "",
          claims: response.data.data.claims || "",
          description: response.data.data.description || "",
          patent_class: response.data.data.patent_class || "",
          patent_type: response.data.data.patent_type || ""
        });

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
    if (selectedPlan === "custom") total += 79;

    // FREE 2D/3D rendering for Custom plan
    if (selectedServices.drawing2D3D && selectedPlan !== "custom") total += 20;

    if (selectedServices.evaluation === "good") total += 250;
    if (selectedServices.evaluation === "better") total += 500;
    if (selectedServices.evaluation === "best") total += 1999;
    if (selectedServices.pitchDeck) total += 500;
    if (selectedServices.attorneySupport) total += 750;
    return total;
  };

  const buildSelectedServicesPayload = () => {
    const payload = {};

    if (selectedServices.drawing2D3D) {
      payload.drawing2D3D = true;
    }

    if (selectedServices.pitchDeck) {
      payload.pitchDeck = true;
    }

    if (selectedServices.attorneySupport) {
      payload.attorneySupport = true;
    }

    if (selectedServices.evaluation) {
      payload.evaluation = selectedServices.evaluation;
    }

    return payload;
  };

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
        const {
          title,
          inventors,
          assignee,
          filing_date,
          issue_date,
          abstract,
        } = manualPatentData;
        if (!title?.trim()) {
          toast.error("Please enter Patent Title");
          return;
        }
        const hasInventor =
          Array.isArray(inventors) &&
          inventors.some(
            (inv) => inv?.first_name?.trim() || inv?.last_name?.trim(),
          );
        if (!hasInventor) {
          toast.error(
            "Please enter at least one inventor (First and Last name)",
          );
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
      if (isLoggedIn || personalInfoSubmitted || sellerId || persistentUserId) {
        setCurrentStep(5);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      // Step 4: Personal Info
      if (!isLoggedIn) {
        const { firstName, lastName, email, phone } = contactInfo;
        if (
          !firstName?.trim() ||
          !lastName?.trim() ||
          !email?.trim() ||
          !phone?.trim()
        ) {
          toast.error("Please fill in all contact information fields");
          return;
        }
        handlePayLater(); // This will advance to Step 5 on success
      } else {
        setCurrentStep(5);
      }
    } else if (currentStep === 5) {
      // Step 5: Patent Evaluation
      setCurrentStep(6);
    } else if (currentStep === 6) {
      // Step 6: Other Services
      setCurrentStep(7);
    } else if (currentStep === 7) {
      // Step 7: Pricing
      if (pricing.isAuction && !pricing.auctionPrice) {
        toast.error("Please enter an auction starting price");
        return;
      }
      if (pricing.isListedPrice && !pricing.listedPrice) {
        toast.error("Please enter a listed price");
        return;
      }
      setCurrentStep(8);
    } else if (currentStep === 8) {
      // Step 8: Membership plan required
      if (!selectedPlan) {
        toast.error("Please select a membership plan");
        return;
      }
      setCartTotal(calculateTotal());
      setCurrentStep(9);
    } else if (currentStep === 9) {
      // Step 9: What happens next – continue to payment
      setCurrentStep(10);
    } else if (currentStep === 10) {
      // Step 10: Review Order & Payment
      if (showPaymentForm || clientSecret) return;
      if (!packageSettings) {
        toast.error("Payment settings are unavailable right now.");
        return;
      }
      handleCreatePaymentIntent();
    }
  };

  const handlePayLater = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", contactInfo.firstName);
      formData.append("last_name", contactInfo.lastName);
      formData.append("email", contactInfo.email);
      formData.append("mobile", contactInfo.phone);
      formData.append(
        "patent_number",
        patentNumber || manualPatentData.patent_number,
      );

      const patent_data = {
        title: manualPatentData.title,
        inventor: manualPatentData.inventors.map((inv) => ({
          firstName: inv.first_name,
          lastName: inv.last_name,
        })),
        assignee: manualPatentData.assignee,
        filing_date: manualPatentData.filing_date,
        issue_date: manualPatentData.issue_date,
        abstract: manualPatentData.abstract,
        claims: manualPatentData.claims,
        description: manualPatentData.description,
        patent_class: manualPatentData.patent_class,
        patent_type: manualPatentData.patent_type,
      };
      formData.append("patent_data", JSON.stringify(patent_data));

      // Images per user requirement: patent_images for main, additional_images for optional
      patentImages.forEach((img, idx) => {
        formData.append(`patent_images[${idx}]`, img);
      });
      additionalImages.forEach((img, idx) => {
        formData.append(`additional_images[${idx}]`, img);
      });

      const response = await patentsApi.payLater(formData);

      if (response.data.error === false || response.data.error === "false") {

        const data = response.data.data;
        console.log({ data });

        // Aggressively search for any ID returned, mapping it to both fields as requested
        const id = data?.user_id || data?.seller_id || data?.id || response.data.user_id || response.data.seller_id || response.data.id;

        if (id) {
          setSellerId(id);
          setPersistentUserId(id);
        }

        setPersonalInfoSubmitted(true);
        toast.success("Information saved successfully!");
        setCurrentStep(5);
      } else {
        toast.error(response.data.message || "Failed to save information");
      }
    } catch (error) {
      console.error("Pay later error:", error);
      toast.error("An error occurred while saving information");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planKey) => {
    let planPackage;
    if (planKey === "monthly") {
      planPackage = planPackages.monthly;
    } else if (planKey === "yearly") {
      planPackage = planPackages.yearly;
    } else if (planKey === "custom") {
      planPackage = planPackages.custom;
    }
    setSelectedPlan(planKey);
    setSelectedPackage(planPackage || null);
  };

  const handleSubmit = async ({
    paymentIntentId,
    paymentTransactionId: transactionId,
  } = {}) => {
    setLoading(true);
    localStorage.removeItem(STORAGE_KEY);
    toast.success(
      "Patent added successfully! Redirecting to dashboard...",
    );
    if (onComplete) onComplete();

  };

  // Map selected plan key ("monthly" | "yearly") to a membership plan from API.
  // We treat membership plans as "packages" by adding a synthetic final_price field.
  const mapPlanToPackage = (planKey, plans) => {
    if (!plans?.length) return null;
    const targetType = planKey === "monthly" ? "monthly" : planKey === "yearly" ? "yearly" : "custom";

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

    if (!plan) return null;

    return {
      ...plan,
      // Keep compatibility with existing Stripe/payment UI that expects final_price
      final_price: Number(plan.price ?? (planKey === "monthly" ? 29 : planKey === "yearly" ? 199 : 79)),
    };
  };

  const planPackages = useMemo(() => {
    return {
      monthly: mapPlanToPackage("monthly", listingPackages),
      yearly: mapPlanToPackage("yearly", listingPackages),
      custom: mapPlanToPackage("custom", listingPackages),
    };
  }, [listingPackages]);

  useEffect(() => {
    if (!selectedPlan) return;
    let nextPackage;
    if (selectedPlan === "monthly") nextPackage = planPackages.monthly;
    else if (selectedPlan === "yearly") nextPackage = planPackages.yearly;
    else if (selectedPlan === "custom") nextPackage = planPackages.custom;

    if (nextPackage && nextPackage !== selectedPackage) {
      setSelectedPackage(nextPackage);
    }
  }, [selectedPlan, planPackages, selectedPackage]);

  // Load membership plans from MustangIP backend for Step 6
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
            res?.data,
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
    if (currentStep !== 8 || packageSettings) return;
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
    if (currentStep !== 8 || !selectedPlan) return;
    const fetchOrderSummary = async () => {
      try {
        setIsOrderSummaryLoading(true);
        const res = await sellerOrderApi.calculateOrderTotal({
          membership_plan: selectedPlan,
          selected_services: buildSelectedServicesPayload(),
          seller_id: sellerId || userData?.seller_id || userData?.seller?.id || userData?.data?.seller_id,
          user_id: persistentUserId || userData?.id || userData?.data?.id,
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
          "Membership plan is missing. Please go back and select a plan.",
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
        seller_id: persistentUserId || signUpData?.id || sellerId || userData?.seller_id || userData?.seller?.id || userData?.data?.seller_id,
        user_id: persistentUserId || userData?.id || userData?.data?.id,
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

        const transactionId = paymentIntentData?.metadata?.payment_transaction_id ||
          paymentIntentData?.payment_transaction_id ||
          paymentIntentData?.transaction_id ||
          gatewayResponse?.payment_transaction_id ||
          gatewayResponse?.transaction_id ||
          res.data.data?.payment_transaction_id ||
          res.data.data?.transaction_id ||
          res.data?.payment_transaction_id ||
          res.data?.transaction_id;

        if (res.data.data?.order_summary) {
          setOrderSummary(res.data.data.order_summary);
        }
        if (!secret) {
          setPaymentInitError(
            "Payment intent created, but client secret is missing.",
          );
          return;
        }
        setClientSecret(secret);
        setPaymentTransactionId(transactionId || null);
        setShowPaymentForm(true);
      } else {
        const fallback = res?.data
          ? JSON.stringify(res.data)
          : "Failed to initialize payment.";
        setPaymentInitError(formatValidationError(res?.data) || fallback);
      }
    } catch (error) {
      console.error("Payment intent error:", error);
      const fallback = error?.response?.data
        ? JSON.stringify(error.response.data)
        : "Failed to initialize payment.";
      setPaymentInitError(
        formatValidationError(error?.response?.data) || fallback,
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
        "Missing payment transaction ID. Please retry payment creation.",
      );
      return;
    }
    handleSubmit({
      paymentIntentId: paymentIntent?.id,
      paymentTransactionId: transactionId,
    });
    localStorage.removeItem(STORAGE_KEY);
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
            "Account created, but login failed. Please log in to continue.",
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
    <div className="container max-w-4xl mx-auto py-10 ">
      <Link href="/">
        <Button variant="outline" className='fixed top-3 left-3'>
          <ChevronLeft />
        </Button>
      </Link>
      <div className="flex items-center gap-2 justify-center flex-col">
        <Image src={ToniLexington} alt="Toni Lexington" width={100} height={100} className="rounded-full" />
        <h1 className="text-2xl font-bold">Hi I'm Toni.</h1>
        {currentStep === 1 && <p className="text-gray-400">I&apos;ll help you list your idea and/or patent</p>}
        {currentStep === 2 && <p className="text-gray-400">Ok, now provide some basic information below.</p>}
        {currentStep === 3 && <p className="text-gray-400">Thanks. Now upload pictures to make your idea stand out.</p>}
        {currentStep === 4 && <p className="text-gray-400">Who will be the main contact for this listing? </p>}
        {currentStep === 5 && <p className="text-gray-400">Would you like to know what your idea is worth?</p>}
        {currentStep === 6 && <p className="text-gray-400">Would you like to add some other services?</p>}
        {currentStep === 7 && <p className="text-gray-400">Tell us your financial expectations for this listing.</p>}

      </div>
      {/* Progress Steps – hide on step 9 (What happens next) per feedback R */}
      <div className="flex items-center justify-between mb-8 hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm ${currentStep >= step
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
                }`}
            >
              {currentStep > step ? <CheckCircle2 size={18} /> : step}
            </div>
            {step < 10 && (
              <div
                className={`flex-1 h-1 mx-1 sm:mx-2 ${currentStep > step ? "bg-primary" : "bg-muted"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="shadow-xl border-0">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Do you already have a patent?"}
            {currentStep === 2 && "Patent Information"}
            {currentStep === 3 && "Upload Images"}
            {currentStep === 4 && "Personal Information"}
            {currentStep === 5 && "Patent Evaluation by Expert"}
            {currentStep === 6 && "Other Additional Services"}
            {currentStep === 7 && "Pricing"}
            {currentStep === 8 && "Listing Advertising Packages"}
            {currentStep === 9 && "What happens next"}
            {currentStep === 10 && "Review Order"}
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
                    ✓ Patent data found and auto-populated. You can edit if
                    needed.
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
                  value={manualPatentData.title}
                  onChange={(e) => {
                    setManualPatentData({
                      ...manualPatentData,
                      title: e.target.value,
                    });
                  }}
                />
              </div>
              {/* Inventors: First name, Last name; + Add Inventor */}
              <div className="space-y-2">
                <Label>Inventors</Label>
                {manualPatentData.inventors.map((inv, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="Inventor First Name"
                      value={inv.first_name}
                      onChange={(e) => {
                        const next = [...manualPatentData.inventors];
                        next[idx] = {
                          ...next[idx],
                          first_name: e.target.value,
                        };
                        setManualPatentData({
                          ...manualPatentData,
                          inventors: next,
                        });
                      }}
                    />
                    <Input
                      placeholder="Inventor Last Name"
                      value={inv.last_name}
                      onChange={(e) => {
                        const next = [...manualPatentData.inventors];
                        next[idx] = {
                          ...next[idx],
                          last_name: e.target.value,
                        };
                        setManualPatentData({
                          ...manualPatentData,
                          inventors: next,
                        });
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setManualPatentData({
                      ...manualPatentData,
                      inventors: [
                        ...manualPatentData.inventors,
                        { first_name: "", last_name: "" },
                      ],
                    })
                  }
                >
                  + Add Inventor
                </Button>
              </div>
              <div>
                <Label>Abstract (Summary of patent)</Label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={manualPatentData.abstract}
                  onChange={(e) => {
                    setManualPatentData({
                      ...manualPatentData,
                      abstract: e.target.value,
                    });
                  }}
                />
              </div>
              {/* <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={manualPatentData.issue_date}
                  onChange={(e) => {
                    setManualPatentData({
                      ...manualPatentData,
                      issue_date: e.target.value,
                    });
                  }}
                />
              </div> */}
              <div>
                <Label>Patent or Application Number</Label>
                <Input
                  value={manualPatentData.assignee}
                  onChange={(e) => {
                    setManualPatentData({
                      ...manualPatentData,
                      assignee: e.target.value,
                    });
                  }}
                />
              </div>
              {/* <div>
                <Label>Filing Date</Label>
                <Input
                  type="date"
                  value={manualPatentData.filing_date}
                  onChange={(e) => {
                    setManualPatentData({
                      ...manualPatentData,
                      filing_date: e.target.value,
                    });
                  }}
                />
              </div> */}

              {/* <div>
                <Label>Patent Class</Label>
                <Input
                  placeholder="e.g., G06F17/30"
                  value={manualPatentData.patent_class}
                  onChange={(e) => {
                    setManualPatentData({
                      ...manualPatentData,
                      patent_class: e.target.value,
                    });
                  }}
                />
              </div> */}

              {/* <div>
                <Label>Patent Type</Label>
                <Input
                  placeholder="e.g., Utility"
                  value={manualPatentData.patent_type}
                  onChange={(e) => {
                    setManualPatentData({
                      ...manualPatentData,
                      patent_type: e.target.value,
                    });
                  }}
                />
              </div> */}

              {/* Claims & Description hidden for now */}
            </div>
          )}

          {/* Step 3: Image Upload (no sign-in required) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Patent Images (Required)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload
                    className="mx-auto mb-4 text-muted-foreground"
                    size={48}
                  />
                  <p className="mb-2">Upload patent images</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files, "patent")
                    }
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
                  <Upload
                    className="mx-auto mb-4 text-muted-foreground"
                    size={48}
                  />
                  <p className="mb-2">Upload additional images</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files, "additional")
                    }
                    className="max-w-xs mx-auto"
                  />
                </div>
                {additionalImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {additionalImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Additional ${idx + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Additional Services first (N); sign-in required; image on side (N2, O) */}
          {/* Step 4: Personal Info */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold -mt-4 text-gray-500">
                Please enter your contact information
              </p>
              {!isLoggedIn ? (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={contactInfo.firstName}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={contactInfo.lastName}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={contactInfo.email}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone</Label>
                    <PhoneInput
                      country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
                      value={contactInfo.phone}
                      onChange={(phone) => {
                        setContactInfo({ ...contactInfo, phone })
                      }}
                      inputProps={{
                        name: "phone",
                        required: true,
                      }}
                      enableLongNumbers
                    />

                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Logged in as{" "}
                    <strong>{userData?.name || userData?.email}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Patent Evaluation by Expert */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold -mt-4 text-gray-500">
                Having a professional evaluation would you negotiate with buyers and partners.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="col-span-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div
                      className={` p-3 border-2 rounded-lg cursor-pointer relative ${selectedServices.evaluation === "good"
                        ? " border-primary shadow-xl bg-blue-100"
                        : " bg-gray-50 "

                        }`}
                      onClick={() =>
                        setSelectedServices({
                          ...selectedServices,
                          evaluation: "good",
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Image
                            src={good}
                            alt="good"
                            className="w-full"
                            width={50}
                            height={50}
                          />
                          <p className="font-medium">
                            Good - Basic Evaluation
                          </p>
                          <p className="text-sm text-muted-foreground">
                            $250 • 2 pages
                          </p>
                        </div>
                        {selectedServices.evaluation === "good" ? (
                          <CheckCircle2 className="text-primary absolute top-2 right-2" />
                        ) : (
                          <Circle className="text-gray-500 absolute top-2 right-2" />
                        )}
                      </div>
                    </div>
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer relative ${selectedServices.evaluation === "better"
                        ? "border-primary shadow-xl bg-blue-100"
                        : "bg-gray-50"
                        }`}
                      onClick={() =>
                        setSelectedServices({
                          ...selectedServices,
                          evaluation: "better",
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Image
                            src={better}
                            alt="better"
                            className="w-full"
                            width={50}
                            height={50}
                          />
                          <p className="font-medium">
                            Better - Comprehensive
                          </p>
                          <p className="text-sm text-muted-foreground">
                            $1,750 • 6-20 pages
                          </p>
                        </div>
                        {selectedServices.evaluation === "better" ? (
                          <CheckCircle2 className="text-primary absolute top-2 right-2" />
                        ) : (
                          <Circle className="text-gray-500 absolute top-2 right-2" />
                        )}
                      </div>
                    </div>
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer relative ${selectedServices.evaluation === "best"
                        ? "border-primary shadow-xl bg-blue-100"
                        : "bg-gray-50"
                        }`}
                      onClick={() =>
                        setSelectedServices({
                          ...selectedServices,
                          evaluation: "best",
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Image
                            src={best}
                            alt="best"
                            className="w-full"
                            width={50}
                            height={50}
                          />
                          <p className="font-medium">
                            Best - Detailed Report
                          </p>
                          <p className="text-sm text-muted-foreground">
                            $5,000 • 15-30 pages
                          </p>
                        </div>
                        {selectedServices.evaluation === "best" ? (
                          <CheckCircle2 className="text-primary absolute top-2 right-2" />
                        ) : (
                          <Circle className="text-gray-500 absolute top-2 right-2" />
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Other Additional Services */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold -mt-4 text-gray-500">
                Please select other services you want to avail
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="col-span-4 space-y-4">
                  <Card
                    className={`cursor-pointer border-2  flex items-stretch gap-2 relative transition-all ${selectedServices.drawing2D3D
                      ? "border-primary bg-blue-100 shadow-xl "
                      : " bg-gray-50 "
                      }`}
                    onClick={() =>
                      setSelectedServices({
                        ...selectedServices,
                        drawing2D3D: !selectedServices.drawing2D3D,
                      })
                    }
                  >
                    <CardHeader className="p-0 relative aspect-[1/] flex-shrink-0 ">
                      <Image
                        src={D2D3}
                        alt="2D/3D Drawing of Your Idea"
                        height={150}
                        width={300}
                        className="object-cover rounded-l-lg "
                      />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="flex items-center justify-between pt-3">
                        2D/3D Drawing of Your Idea
                      </CardTitle>
                      <CardDescription>$300</CardDescription>
                      <p className="text-sm text-muted-foreground mb-2">
                        Professional visualization of your patent idea
                      </p>
                      <Button variant="link" size="sm">
                        View Sample
                      </Button>
                    </CardContent>
                    {selectedServices.drawing2D3D ? (
                      <CheckCircle2 className="text-primary absolute top-2 right-2" />
                    ) : (
                      <Circle className="text-gray-500 absolute top-2 right-2" />
                    )}
                  </Card>

                  <Card
                    className={`cursor-pointer border-2 flex items-stretch gap-2 relative transition-all ${selectedServices.pitchDeck
                      ? "border-primary bg-blue-100 shadow-xl"
                      : "bg-gray-50"
                      }`}
                    onClick={() =>
                      setSelectedServices({
                        ...selectedServices,
                        pitchDeck: !selectedServices.pitchDeck,
                      })
                    }
                  >
                    <CardHeader className="p-0 relative aspect-[2/1] flex-shrink-0 w-[300px] ">
                      <Image
                        src={PitchDeck}
                        alt="Professional Pitch Deck"
                        fill
                        className="object-cover rounded-l-lg"
                      />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="flex items-center justify-between pt-3">
                        Professional Pitch Deck
                      </CardTitle>
                      <CardDescription>$900</CardDescription>
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
                    className={`cursor-pointer border-2 flex items-stretch gap-2 transition-all relative ${selectedServices.attorneySupport
                      ? "border-primary bg-blue-100 shadow-xl"
                      : "bg-gray-50"
                      }`}
                    onClick={() =>
                      setSelectedServices({
                        ...selectedServices,
                        attorneySupport: !selectedServices.attorneySupport,
                      })
                    }
                  >
                    <CardHeader className="p-0 relative aspect-[2/1] flex-shrink-0 w-[300px]">
                      <Image
                        src={Paperwork}
                        alt="Attorney Support"
                        fill
                        className="object-cover rounded-l-lg"
                      />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="flex items-center justify-between pt-3">
                        Attorney Support
                      </CardTitle>
                      <CardDescription>$450</CardDescription>
                      <p className="text-sm text-muted-foreground mb-2">
                        Help with paperwork for the sale or investment of your
                        patent
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
            </div>
          )}

          {/* Step 7: Pricing */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Auction / Offer</h3>
                    <p className="text-sm text-gray-500">Set a starting amount and let buyers compete for your item.</p>
                  </div>
                  <Switch
                    checked={pricing.isAuction}
                    onCheckedChange={(val) => setPricing({ ...pricing, isAuction: val })}
                  />
                </div>
                {pricing.isAuction && (
                  <div className="relative max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      className="pl-7"
                      placeholder="0.00"
                      value={pricing.auctionPrice}
                      onChange={(e) => setPricing({ ...pricing, auctionPrice: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Listed Price</h3>
                    <p className="text-sm text-gray-500">Buyers can purchase immediately at this price.</p>
                  </div>
                  <Switch
                    checked={pricing.isListedPrice}
                    onCheckedChange={(val) => setPricing({ ...pricing, isListedPrice: val })}
                  />
                </div>
                {pricing.isListedPrice && (
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-xs text-gray-500">Beat the online trending price to maximize your chance of selling.</p>
                      <p className="text-sm mt-2">Recommended price: <span className="font-semibold">$500 - $1,000</span></p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">See how other sellers priced it</Button>
                    </div>
                    <div className="relative max-w-[150px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        className="pl-7"
                        placeholder="0.00"
                        value={pricing.listedPrice}
                        onChange={(e) => setPricing({ ...pricing, listedPrice: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h3 className="text-lg font-semibold">Allow direct messages to me to negotiate</h3>
                  <p className="text-sm text-gray-500">Choose when you want your listing to appear on MustangIP.</p>
                </div>
                <Switch
                  checked={pricing.allowNegotiation}
                  onCheckedChange={(val) => setPricing({ ...pricing, allowNegotiation: val })}
                />
              </div>
            </div>
          )}

          {/* Step 8: Listing Advertising Packages (monthly or annual) */}
          {
            currentStep === 8 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isPackagesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading membership options...
                  </p>
                ) : (
                  <>
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
                          <li className="font-semibold text-primary">✓ FREE 2D/ 3D rendering</li>
                        </ul>
                      </CardContent>
                      {selectedPlan === "custom" ? (
                        <CheckCircle2 className="text-primary absolute top-2 right-2" />
                      ) : (
                        <Circle className="text-gray-500 absolute top-2 right-2 " />
                      )}
                    </Card>
                  </>
                )}
              </div>
            )
          }

          {/* Step 9: What happens next (R) – no status bar; circle image, 1) 2) 3), phone/email on right */}
          {
            currentStep === 9 && (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                  <p className="font-medium">What happens next?</p>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>
                      An account manager will be assigned to help you stay
                      engaged.
                    </li>
                    <li>A sales person will call to confirm everything.</li>
                    <li>You&apos;ll receive a welcome email with next steps.</li>
                  </ol>
                </div>
                <div className="w-full md:w-auto flex flex-col items-center gap-2 shrink-0">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    <Image
                      src={UserAvatar}
                      alt={
                        userData?.name ||
                        accountState?.name ||
                        "Your account manager"
                      }
                      height={50}
                      width={50}
                      className="object-cover w-full"
                    />
                  </div>
                  <div className="text-center text-sm">
                    <p className="font-medium">
                      Toni Lexington
                    </p>
                    <p>
                      toni@mustangip.com
                    </p>
                    <p>
                      312-222-1234
                    </p>
                  </div>
                </div>
              </div>
            )
          }
          {/* Step 10: Review Order (S) – order summary, edit links, payment at bottom */}
          {
            currentStep === 10 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(5)}
                  >
                    Edit Evaluation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(6)}
                  >
                    Edit Additional Services
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(7)}
                  >
                    Edit Pricing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(8)}
                  >
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
                          ? `$${orderSummary.membership_price}/${orderSummary?.membership_plan === "yearly"
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
                            <span>
                              Evaluation ({selectedServices.evaluation}):
                            </span>
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
                            <span>$500</span>
                          </div>
                        )}
                        {selectedServices.attorneySupport && (
                          <div className="flex justify-between">
                            <span>Attorney Support:</span>
                            <span>$750</span>
                          </div>
                        )}
                        <div className="border-t my-2" />
                        {pricing.isAuction && (
                          <div className="flex justify-between">
                            <span>Auction Starting Price:</span>
                            <span>${pricing.auctionPrice}</span>
                          </div>
                        )}
                        {pricing.isListedPrice && (
                          <div className="flex justify-between">
                            <span>Listed Price:</span>
                            <span>${pricing.listedPrice}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Allow Negotiation:</span>
                          <span>{pricing.allowNegotiation ? "Yes" : "No"}</span>
                        </div>
                      </>
                    )}
                    {orderSummary?.discount?.eligible && orderSummary.discount.amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({orderSummary.discount.percent}%):</span>
                        <span>-${orderSummary.discount.amount}</span>
                      </div>
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
                      Payment pending. Please complete Stripe payment to finish
                      signup.
                    </div>
                    <StripePayment
                      selectedPackage={selectedPackage}
                      packageSettings={packageSettings}
                      PaymentModalClose={() => setShowPaymentForm(false)}
                      setShowStripePayment={() => { }}
                      updateActivePackage={() => { }}
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
            )
          }

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
              disabled={
                currentStep === 10 &&
                (isCreatingPaymentIntent || !packageSettings)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Processing...
                </>
              ) : currentStep === 10 ? (
                <>
                  {isCreatingPaymentIntent
                    ? "Preparing Payment..."
                    : "Complete Signup"}
                  <ArrowRight className="ml-2" size={16} />
                </>
              ) : currentStep === 9 ? (
                <>
                  Continue to Payment
                  <ArrowRight className="ml-2" size={16} />
                </>
              ) : (
                <>
                  {currentStep === 5 || currentStep === 6 || currentStep === 7 ? "Submit & Continue" : "Next"}
                  <ArrowRight className="ml-2" size={16} />
                </>
              )}
            </Button>
          </div>
        </CardContent >
      </Card >
    </div >
  );
};

export default SellerSignupWizard;
