import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import useAutoFocus from "../Common/useAutoFocus";
import { toast } from "sonner";
import { t } from "@/utils";
import { authApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { Fcmtoken } from "@/redux/reducer/settingSlice";
import { loadUpdateData } from "@/redux/reducer/authSlice";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const LoginWithEmailForm = ({ OnHide }) => {
  const emailRef = useAutoFocus();
  const fetchFCM = useSelector(Fcmtoken);
  const [loginStates, setLoginStates] = useState({
    email: "",
    password: "",
    IsPasswordVisible: false,
    showLoader: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const { email, password, IsPasswordVisible, showLoader } = loginStates;

  const Signin = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: "",
      password: "",
    };

    let hasErrors = false;

    if (!email) {
      newErrors.email = t("emailRequired") || "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("emailInvalid") || "Invalid email format";
      hasErrors = true;
    }
    if (!password) {
      newErrors.password = t("passwordRequired") || "Password is required";
      hasErrors = true;
    } else if (password.length < 6) {
      newErrors.password = t("passwordTooShort") || "Password must be at least 6 characters";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) {
      const firstError = Object.values(newErrors).find((error) => error);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    try {
      setLoginStates((prev) => ({ ...prev, showLoader: true }));
      const response = await authApi.login({
        email,
        password,
        fcm_id: fetchFCM ? fetchFCM : "",
      });

      const data = response.data;
      if (data?.error === false || data?.error === "false") {
        loadUpdateData(data);
        toast.success(data.message);
        
        // Check if user has seller account and redirect accordingly
        const hasSellerAccount = Boolean(
          data?.data?.seller_id ||
          data?.data?.seller?.id ||
          data?.data?.is_seller === 1 ||
          data?.data?.is_seller === true
        );

        // Call OnHide callback which will handle navigation
        // The parent component (Login page) will check user role and redirect
        OnHide();
      } else {
        toast.error(data?.message || t("somethingWentWrong"));
      }
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        (error?.response?.data
          ? JSON.stringify(error.response.data)
          : null);
      
      // Handle server-side validation errors
      if (error?.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const newErrors = { ...errors };
        
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
      
      console.error("Login error response:", error?.response || error);
      toast.error(serverMessage || t("somethingWentWrong"));
    } finally {
      setLoginStates((prev) => ({ ...prev, showLoader: false }));
    }
  };

  const handleForgotModal = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t("emailRequired"));
      return;
    }
    try {
      await authApi.forgotPassword({ email });
      toast.success(t("resetPassword"));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("somethingWentWrong"));
    }
  };

  return (
    <form className="space-y-5" onSubmit={Signin}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("email")}</Label>
        <Input
          type="email"
          placeholder={t("enterEmail")}
          value={email}
          onChange={(e) => {
            setLoginStates((prev) => ({ ...prev, email: e.target.value }));
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
          className={`h-11 rounded-lg ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          ref={emailRef}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{t("password")}</Label>
          <button
            type="button"
            onClick={handleForgotModal}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("forgtPassword")}
          </button>
        </div>
        <div className="relative">
          <Input
            type={IsPasswordVisible ? "text" : "password"}
            placeholder={t("enterPassword")}
            className={`h-11 rounded-lg ltr:pr-10 rtl:pl-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            value={password}
            onChange={(e) => {
              setLoginStates((prev) => ({
                ...prev,
                password: e.target.value,
              }));
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: "" }));
              }
            }}
          />
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-muted-foreground hover:text-foreground"
            onClick={() =>
              setLoginStates((prev) => ({
                ...prev,
                IsPasswordVisible: !prev.IsPasswordVisible,
              }))
            }
          >
            {IsPasswordVisible ? (
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
      <Button
        type="submit"
        className="w-full h-12 rounded-lg font-medium text-base"
        disabled={showLoader}
      >
        {showLoader ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          t("signIn")
        )}
      </Button>
    </form>
  );
};

export default LoginWithEmailForm;
