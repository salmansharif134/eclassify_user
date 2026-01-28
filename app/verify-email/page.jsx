"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      const id = searchParams.get("id");
      const hash = searchParams.get("hash");
      const expires = searchParams.get("expires");
      const signature = searchParams.get("signature");
      const statusParam = searchParams.get("status");

      if (statusParam === "verified") {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      if (statusParam === "already_verified") {
        setStatus("info");
        setMessage("Email is already verified.");
        return;
      }

      if (statusParam === "invalid_token") {
        setStatus("error");
        setMessage("Invalid or expired verification link.");
        return;
      }

      if (id && hash && expires && signature) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const endpoint = process.env.NEXT_PUBLIC_END_POINT || "/api/";
          const fullUrl = `${apiUrl}${endpoint}auth/email/verify`;
          
          const response = await fetch(fullUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: Number(id),
              hash,
              expires,
              signature,
            }),
          });
          
          // Check if response is ok (status 200-299)
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            setStatus("error");
            setMessage(errorData?.message || `Verification failed. Status: ${response.status}`);
            return;
          }
          
          const data = await response.json();
          if (data?.error === false || data?.error === "false") {
            setStatus("success");
            setMessage(data?.message || "Email verified successfully!");
            setTimeout(() => router.push("/"), 3000);
          } else {
            setStatus("error");
            setMessage(data?.message || "Verification failed.");
          }
        } catch (error) {
          setStatus("error");
          setMessage("An error occurred. Please try again. " + (error.message || ""));
        }
      } else {
        setStatus("error");
        setMessage("Invalid verification link. Missing required parameters.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-sm border">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Email Verification</h2>
            <p
              className={`text-sm ${
                status === "error"
                  ? "text-red-600"
                  : status === "success"
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              {message}
            </p>
          </div>

          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {status !== "loading" && (
            <div className="flex justify-center">
              <Button onClick={() => router.push("/")}>Go to Home</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage;
