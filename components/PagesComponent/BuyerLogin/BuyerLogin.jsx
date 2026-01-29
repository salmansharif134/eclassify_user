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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary/5 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1.5 pb-2 text-center px-8 pt-8">
            <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to browse and purchase products.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <LoginWithEmailForm OnHide={handleLoginSuccess} />
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <CustomLink href="/buyer-signup" className="font-medium text-primary hover:underline">
                Create account
              </CustomLink>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerLogin;
