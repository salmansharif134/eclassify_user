"use client";
import Layout from "@/components/Layout/Layout";
import SellerSignupWizard from "@/components/PagesComponent/SellerSignup/SellerSignupWizard";

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
