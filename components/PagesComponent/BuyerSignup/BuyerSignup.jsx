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

const BuyerSignup = () => {
  const { navigate } = useNavigate();
  const isLoggedIn = useSelector(getIsLoggedIn);
  const fetchFCM = useSelector(Fcmtoken);
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
          navigate("/");
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
        navigate("/");
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
    <div className="container max-w-lg mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Buyer Sign Up</CardTitle>
          <CardDescription>Create an account to start shopping for products.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            <div className="labelInputCont">
              <Label className="requiredInputLabel">First Name</Label>
              <Input
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="labelInputCont">
              <Label className="requiredInputLabel">Last Name</Label>
              <Input
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="labelInputCont">
              <Label className="requiredInputLabel">{t("email")}</Label>
              <Input
                type="email"
                placeholder={t("enterEmail")}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="labelInputCont">
              <Label className="requiredInputLabel">{t("password")}</Label>
              <div className="flex items-center relative">
                <Input
                  type={formData.IsPasswordVisible ? "text" : "password"}
                  placeholder={t("enterPassword")}
                  className={`ltr:pr-9 rtl:pl-9 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
                  onClick={() =>
                    handleInputChange("IsPasswordVisible", !formData.IsPasswordVisible)
                  }
                >
                  {formData.IsPasswordVisible ? (
                    <FaRegEye size={20} />
                  ) : (
                    <FaRegEyeSlash size={20} />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Minimum 6 characters</p>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="labelInputCont">
              <Label className="requiredInputLabel">Confirm Password</Label>
              <div className="flex items-center relative">
                <Input
                  type={formData.IsConfirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`ltr:pr-9 rtl:pl-9 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
                  onClick={() =>
                    handleInputChange(
                      "IsConfirmPasswordVisible",
                      !formData.IsConfirmPasswordVisible
                    )
                  }
                >
                  {formData.IsConfirmPasswordVisible ? (
                    <FaRegEye size={20} />
                  ) : (
                    <FaRegEyeSlash size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="text-xl text-white font-light px-4 py-2"
              size="big"
              disabled={formData.showLoader}
            >
              {formData.showLoader ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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

          <div className="text-sm text-center">
            Already have an account?{" "}
            <CustomLink href="/buyer-login" className="text-primary underline">
              Sign In
            </CustomLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerSignup;
