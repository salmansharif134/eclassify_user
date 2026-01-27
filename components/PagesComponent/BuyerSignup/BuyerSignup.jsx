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
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    IsPasswordVisible: false,
    IsConfirmPasswordVisible: false,
    showLoader: false,
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email) {
      toast.error(t("emailRequired"));
      return;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error(t("emailInvalid"));
      return;
    }
    if (!formData.password) {
      toast.error(t("passwordRequired"));
      return;
    } else if (formData.password.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setFormData((prev) => ({ ...prev, showLoader: true }));
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const data = response.data;
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
          navigate("/buyer-login");
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
              <Label className="requiredInputLabel">Full Name</Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="labelInputCont">
              <Label className="requiredInputLabel">{t("email")}</Label>
              <Input
                type="email"
                placeholder={t("enterEmail")}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="labelInputCont">
              <Label className="requiredInputLabel">{t("password")}</Label>
              <div className="flex items-center relative">
                <Input
                  type={formData.IsPasswordVisible ? "text" : "password"}
                  placeholder={t("enterPassword")}
                  className="ltr:pr-9 rtl:pl-9"
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
            </div>

            <div className="labelInputCont">
              <Label className="requiredInputLabel">Confirm Password</Label>
              <div className="flex items-center relative">
                <Input
                  type={formData.IsConfirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="ltr:pr-9 rtl:pl-9"
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
              onError={() => {
                toast.error("Google sign in failed");
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
