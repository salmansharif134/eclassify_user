"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginWithEmailForm from "@/components/Auth/LoginWithEmailForm";
import CustomLink from "@/components/Common/CustomLink";
import { useNavigate } from "@/components/Common/useNavigate";

const SellerLogin = () => {
  const { navigate } = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/seller-dashboard");
  };

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Seller Login</CardTitle>
          <CardDescription>Sign in to access your seller dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginWithEmailForm OnHide={handleLoginSuccess} />
          <div className="text-sm text-center">
            Don’t have an account?{" "}
            <CustomLink href="/seller-signup" className="text-primary underline">
              Become a Seller
            </CustomLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerLogin;
