import Layout from "@/components/Layout/Layout";
import SellerSignupWizard from "@/components/PagesComponent/SellerSignup/SellerSignupWizard";
import { useNavigate } from "@/components/Common/useNavigate";
import { useEffect } from "react";

export default function SellerSignupPage() {
  return (
    <Layout>
      <SellerSignupWizard
        onComplete={() => {
          // Redirect to dashboard after signup
          if (typeof window !== "undefined") {
            window.location.href = "/seller-dashboard";
          }
        }}
      />
    </Layout>
  );
}
