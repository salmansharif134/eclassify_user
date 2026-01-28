"use client";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginWithEmailForm from "@/components/Auth/LoginWithEmailForm";
import CustomLink from "@/components/Common/CustomLink";
import { useNavigate } from "@/components/Common/useNavigate";
import { useSelector } from "react-redux";
import { userSignUpData, getIsLoggedIn } from "@/redux/reducer/authSlice";

const Login = () => {
  const { navigate } = useNavigate();
  const userData = useSelector(userSignUpData);
  const isLoggedIn = useSelector(getIsLoggedIn);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      const hasSellerAccount = Boolean(
        userData?.seller_id ||
        userData?.seller?.id ||
        userData?.is_seller === 1 ||
        userData?.is_seller === true
      );

      if (hasSellerAccount) {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isLoggedIn, userData, navigate]);

  const handleLoginSuccess = () => {
    // Small delay to ensure Redux state is updated after login
    setTimeout(() => {
      const hasSellerAccount = Boolean(
        userData?.seller_id ||
        userData?.seller?.id ||
        userData?.is_seller === 1 ||
        userData?.is_seller === true
      );

      if (hasSellerAccount) {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }
    }, 100);
  };

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginWithEmailForm OnHide={handleLoginSuccess} />
          <div className="text-sm text-center space-y-2">
            <div>
              Don't have an account?{" "}
              <CustomLink href="/buyer-signup" className="text-primary underline">
                Sign Up as Buyer
              </CustomLink>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
