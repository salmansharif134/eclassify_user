"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginWithEmailForm from "@/components/Auth/LoginWithEmailForm";
import CustomLink from "@/components/Common/CustomLink";
import { useNavigate } from "@/components/Common/useNavigate";

const BuyerLogin = () => {
  const { navigate } = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/");
  };

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Buyer Login</CardTitle>
          <CardDescription>Sign in to browse and purchase products.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginWithEmailForm OnHide={handleLoginSuccess} />
          <div className="text-sm text-center">
            Don't have an account?{" "}
            <CustomLink href="/buyer-signup" className="text-primary underline">
              Sign Up as Buyer
            </CustomLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerLogin;
