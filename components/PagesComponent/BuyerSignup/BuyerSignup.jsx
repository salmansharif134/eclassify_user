"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/utils/api";
import { toast } from "sonner";
import { t } from "@/utils";
import { useNavigate } from "@/components/Common/useNavigate";
import { useSelector } from "react-redux";
import { getIsLoggedIn, loadUpdateData } from "@/redux/reducer/authSlice";
import CustomLink from "@/components/Common/CustomLink";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Fcmtoken } from "@/redux/reducer/settingSlice";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const BuyerSignup = () => {
  const { navigate } = useNavigate();
  const isLoggedIn = useSelector(getIsLoggedIn);
  const fetchFCM = useSelector(Fcmtoken);
  const [signupAsType, setSignupAsType] = useState("buyer"); // "buyer" | "seller"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    IsPasswordVisible: false,
    IsConfirmPasswordVisible: false,
    showLoader: false,
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Reset errors
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let hasErrors = false;

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
      hasErrors = true;
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
      hasErrors = true;
    }
    if (!formData.email) {
      newErrors.email = t("emailRequired") || "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("emailInvalid") || "Invalid email format";
      hasErrors = true;
    }
    if (!formData.password) {
      newErrors.password = t("passwordRequired") || "Password is required";
      hasErrors = true;
    } else if (formData.password.length < 6) {
      newErrors.password = t("passwordTooShort") || "Password must be at least 6 characters";
      hasErrors = true;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) {
      // Show toast for first error
      const firstError = Object.values(newErrors).find((error) => error);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    try {
      setFormData((prev) => ({ ...prev, showLoader: true }));
      const response = await authApi.register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        user_type: signupAsType, // "buyer" | "seller" for backend
      });

      const data = response.data;
      
      // Handle server-side validation errors
      if (response?.data?.errors) {
        const serverErrors = response.data.errors;
        const newErrors = { ...errors };
        
        if (serverErrors.first_name) {
          newErrors.firstName = Array.isArray(serverErrors.first_name) 
            ? serverErrors.first_name[0] 
            : serverErrors.first_name;
        }
        if (serverErrors.last_name) {
          newErrors.lastName = Array.isArray(serverErrors.last_name) 
            ? serverErrors.last_name[0] 
            : serverErrors.last_name;
        }
        if (serverErrors.email) {
          newErrors.email = Array.isArray(serverErrors.email) 
            ? serverErrors.email[0] 
            : serverErrors.email;
        }
        if (serverErrors.password) {
          newErrors.password = Array.isArray(serverErrors.password) 
            ? serverErrors.password[0] 
            : serverErrors.password;
        }
        
        setErrors(newErrors);
      }
      
      if (data?.error === false || data?.error === "false") {
        // Auto login after signup
        const loginResponse = await authApi.login({
          email: formData.email,
          password: formData.password,
          fcm_id: fetchFCM ? fetchFCM : "",
        });

        if (loginResponse.data?.error === false) {
          loadUpdateData(loginResponse.data);
          toast.success("Account created successfully! Welcome!");
          // Redirect by type: buyer → home, seller → seller signup wizard
          if (signupAsType === "seller") {
            navigate("/seller-signup");
          } else {
            navigate("/");
          }
        } else {
          toast.success("Account created! Please login.");
          navigate("/login");
        }
      } else {
        toast.error(data?.message || t("somethingWentWrong"));
      }
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        (error?.response?.data ? JSON.stringify(error.response.data) : null);
      
      // Handle server-side validation errors
      if (error?.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const newErrors = { ...errors };
        
        if (serverErrors.first_name) {
          newErrors.firstName = Array.isArray(serverErrors.first_name) 
            ? serverErrors.first_name[0] 
            : serverErrors.first_name;
        }
        if (serverErrors.last_name) {
          newErrors.lastName = Array.isArray(serverErrors.last_name) 
            ? serverErrors.last_name[0] 
            : serverErrors.last_name;
        }
        if (serverErrors.email) {
          newErrors.email = Array.isArray(serverErrors.email) 
            ? serverErrors.email[0] 
            : serverErrors.email;
        }
        if (serverErrors.password) {
          newErrors.password = Array.isArray(serverErrors.password) 
            ? serverErrors.password[0] 
            : serverErrors.password;
        }
        
        setErrors(newErrors);
      }
      
      toast.error(serverMessage || t("somethingWentWrong"));
    } finally {
      setFormData((prev) => ({ ...prev, showLoader: false }));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setFormData((prev) => ({ ...prev, showLoader: true }));
      const response = await authApi.googleLogin({
        token: credentialResponse.credential,
        fcm_id: fetchFCM ? fetchFCM : "",
      });

      const data = response.data;
      if (data?.error === false || data?.error === "false") {
        loadUpdateData(data);
        toast.success("Signed in successfully!");
        // If they had chosen seller signup, redirect to seller wizard
        if (signupAsType === "seller") {
          navigate("/seller-signup");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data?.message || t("somethingWentWrong"));
      }
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        (error?.response?.data ? JSON.stringify(error.response.data) : null);
      toast.error(serverMessage || t("somethingWentWrong"));
    } finally {
      setFormData((prev) => ({ ...prev, showLoader: false }));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary/5 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1.5 pb-2 text-center px-8 pt-8">
            <CardTitle className="text-2xl font-semibold tracking-tight">Create your account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join as a buyer or seller. Choose your role below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">I want to sign up as</Label>
                <RadioGroup
                  value={signupAsType}
                  onValueChange={setSignupAsType}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="signup-buyer"
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 px-4 cursor-pointer transition-all ${
                      signupAsType === "buyer"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <RadioGroupItem value="buyer" id="signup-buyer" className="sr-only" />
                    <span className="font-medium text-sm">Buyer</span>
                  </label>
                  <label
                    htmlFor="signup-seller"
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 px-4 cursor-pointer transition-all ${
                      signupAsType === "seller"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <RadioGroupItem value="seller" id="signup-seller" className="sr-only" />
                    <span className="font-medium text-sm">Seller</span>
                  </label>
                </RadioGroup>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {signupAsType === "buyer"
                    ? "Start shopping for products and patents."
                    : "Complete onboarding after signup to list your patents."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">First name</Label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`h-11 rounded-lg ${errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last name</Label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`h-11 rounded-lg ${errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("email")}</Label>
                <Input
                  type="email"
                  placeholder={t("enterEmail")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-11 rounded-lg ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  required
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("password")}</Label>
                <div className="relative">
                  <Input
                    type={formData.IsPasswordVisible ? "text" : "password"}
                    placeholder={t("enterPassword")}
                    className={`h-11 rounded-lg ltr:pr-10 rtl:pl-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      handleInputChange("IsPasswordVisible", !formData.IsPasswordVisible)
                    }
                  >
                    {formData.IsPasswordVisible ? (
                      <FaRegEye size={18} />
                    ) : (
                      <FaRegEyeSlash size={18} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirm password</Label>
                <div className="relative">
                  <Input
                    type={formData.IsConfirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`h-11 rounded-lg ltr:pr-10 rtl:pl-10 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      handleInputChange(
                        "IsConfirmPasswordVisible",
                        !formData.IsConfirmPasswordVisible
                      )
                    }
                  >
                    {formData.IsConfirmPasswordVisible ? (
                      <FaRegEye size={18} />
                    ) : (
                      <FaRegEyeSlash size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-lg font-medium text-base mt-1"
                disabled={formData.showLoader}
              >
                {formData.showLoader ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={(error) => {
                  console.error("Google OAuth Error:", error);
                  if (error?.type === "popup_closed_by_user") {
                    toast.error("Sign in cancelled");
                  } else if (error?.error === "popup_blocked") {
                    toast.error("Popup blocked. Please allow popups for this site.");
                  } else {
                    toast.error(
                      "Google sign in failed. Please check that your domain is authorized in Google Cloud Console."
                    );
                  }
                }}
              />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <CustomLink href="/buyer-login" className="font-medium text-primary hover:underline">
                Sign in
              </CustomLink>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerSignup;
