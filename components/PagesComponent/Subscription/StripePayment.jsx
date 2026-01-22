import React, { useState, useEffect, useCallback } from "react";

import {
  Elements,
  ElementsConsumer,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { createPaymentIntentApi } from "@/utils/api";
import { toast } from "sonner";
import { t } from "@/utils";

const StripePayment = ({
  selectedPackage,
  packageSettings,
  PaymentModalClose,
  setShowStripePayment,
  updateActivePackage,
  clientSecretOverride,
  onPaymentSuccess,
  amountDue,
  billingDetails,
}) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStripeInstance = async () => {
      const candidates = [
        packageSettings?.Stripe?.publishable_key,
        packageSettings?.Stripe?.publishableKey,
        packageSettings?.Stripe?.api_key,
        process.env.NEXT_PUBLIC_STRIPE_KEY,
      ].filter(Boolean);

      let publishableKey = candidates.find((key) => key.startsWith("pk_"));
      const hasSecretKey = candidates.some((key) => key.startsWith("sk_"));

      if (!publishableKey) {
        try {
          const response = await fetch("/api/stripe-publishable-key");
          const data = await response.json();
          const fetchedKey =
            data?.data?.publishable_key || data?.data?.publishableKey;
          if (typeof fetchedKey === "string" && fetchedKey.startsWith("pk_")) {
            publishableKey = fetchedKey;
          }
        } catch (error) {
          console.error("Failed to fetch Stripe publishable key:", error);
        }
      }

      if (!publishableKey) {
        if (hasSecretKey) {
          toast.error("Invalid Stripe key. Use a publishable key (pk_*).");
        } else {
          toast.error("Stripe publishable key is missing.");
        }
        return;
      }

      const stripeInstance = await loadStripe(publishableKey);
      setStripePromise(stripeInstance);
    };
    loadStripeInstance();
  }, [
    packageSettings?.Stripe?.api_key,
    packageSettings?.Stripe?.publishable_key,
    packageSettings?.Stripe?.publishableKey,
  ]);

  const handleStripePayment = useCallback(async () => {
    if (clientSecretOverride) {
      setClientSecret(clientSecretOverride);
      setLoading(false);
      return;
    }
    try {
      const res = await createPaymentIntentApi.createIntent({
        package_id: selectedPackage.id,
        payment_method: packageSettings.Stripe.payment_method,
      });
      if (res.data.error === true) {
        toast.error(res.data.message);
        return;
      }
      const paymentIntent =
        res.data.data.payment_intent?.payment_gateway_response;
      const clientSecret = paymentIntent.client_secret;
      setClientSecret(clientSecret);
      if (typeof setShowStripePayment === "function") {
        setShowStripePayment(true);
      }
    } catch (error) {
      console.error("Error during Stripe payment", error);
      toast.error(t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  }, [
    clientSecretOverride,
    selectedPackage?.id,
    packageSettings?.Stripe?.payment_method,
    setShowStripePayment,
  ]);

  useEffect(() => {
    handleStripePayment();
  }, [handleStripePayment]);

  const PaymentForm = ({ elements, stripe }) => {
    const formattedAmount =
      typeof amountDue === "number" ? `$${amountDue}` : null;
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const handleSubmit = async (event) => {
      event.preventDefault();
      setPaymentError("");
      if (isProcessing) return;
      setIsProcessing(true);
      if (!stripe || !elements) {
        setPaymentError("Stripe is not ready. Please try again.");
        setIsProcessing(false);
        return;
      }
      if (!clientSecret) {
        setPaymentError("Missing payment intent. Please retry payment.");
        setIsProcessing(false);
        return;
      }
      try {
        const { paymentIntent: currentIntent, error: retrieveError } =
          await stripe.retrievePaymentIntent(clientSecret);
        if (retrieveError) {
          setPaymentError(retrieveError.message || t("errorOccurred"));
          setIsProcessing(false);
          return;
        }
        if (currentIntent?.status === "succeeded") {
          console.log("Payment already succeeded:", currentIntent);
          console.log("Payment Intent Metadata:", currentIntent.metadata);
          if (typeof onPaymentSuccess === "function") {
            onPaymentSuccess(currentIntent);
          } else {
            updateActivePackage();
          }
          if (typeof PaymentModalClose === "function") {
            PaymentModalClose();
          }
          setIsProcessing(false);
          return;
        }
        if (currentIntent?.status === "requires_action") {
          console.log("3D Secure required, waiting for user action...");
          setPaymentError("Please complete the 3D Secure verification.");
          setIsProcessing(false);
          return;
        }
        if (currentIntent?.status === "canceled") {
          setPaymentError(
            "Payment was canceled. Please create a new payment."
          );
          setIsProcessing(false);
          return;
        }
      } catch (error) {
        setPaymentError(error?.message || t("errorOccurred"));
        setIsProcessing(false);
        return;
      }
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: billingDetails || undefined,
      });

      if (error) {
        setPaymentError(error?.message || t("errorOccurred"));
        setIsProcessing(false);
      } else {
        try {
          const { paymentIntent, error: confirmError } =
            await stripe.confirmCardPayment(clientSecret, {
              payment_method: paymentMethod.id,
            });

          if (confirmError) {
            setPaymentError(confirmError?.message || t("errorOccurred"));
          } else {
            if (paymentIntent.status === "succeeded") {
              console.log("Payment succeeded:", paymentIntent);
              console.log("Payment Intent ID:", paymentIntent.id);
              console.log("Payment Intent Metadata:", paymentIntent.metadata);
              console.log(
                "Transaction ID from metadata:",
                paymentIntent.metadata?.payment_transaction_id ||
                  paymentIntent.metadata?.transaction_id
              );
              if (typeof onPaymentSuccess === "function") {
                onPaymentSuccess(paymentIntent);
              } else {
                updateActivePackage();
              }
              if (typeof PaymentModalClose === "function") {
                PaymentModalClose();
              }
            } else if (paymentIntent.status === "requires_action") {
              console.log("3D Secure required, waiting for user action...");
              setPaymentError("Please complete the 3D Secure verification.");
              setIsProcessing(false);
              return;
            } else {
              console.warn("Payment intent status:", paymentIntent.status);
              toast.error(t("paymentfail " + paymentIntent.status));
            }
          }
        } catch (error) {
          console.error("Error during payment:", error);
          setPaymentError(error?.message || t("errorOccurred"));
        }
        setIsProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="stripe_module">
          <CardElement />
          {paymentError && (
            <div className="text-sm text-destructive mt-2">{paymentError}</div>
          )}
          <button
            className="w-full bg-primary text-white p-2 rounded-md my-4"
            type="submit"
            disabled={!stripePromise || isProcessing}
          >
            {isProcessing
              ? "Processing..."
              : formattedAmount
              ? `Pay ${formattedAmount}`
              : t("pay")}
          </button>
        </div>
      </form>
    );
  };


  return (
    <>
      {loading ? (
        <div className="">
          <div className="animate-pulse">
            <div className="w-full h-10 bg-gray-200 rounded-md mb-2"></div>
            <div className="flex justify-between mb-4">
              <div className="w-1/2 h-5 bg-gray-200 rounded-md"></div>
              <div className="w-1/4 h-5 bg-gray-200 rounded-md"></div>
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-md mt-6"></div>
          </div>
        </div>
      ) : (
        stripePromise &&
        clientSecret && (
          <div className="card">
            {/* <div className="card-header">{t("payWithStripe")} :</div> */}
            <div className="card-body">
              <Elements stripe={stripePromise}>
                <ElementsConsumer>
                  {({ stripe, elements }) => (
                    <PaymentForm elements={elements} stripe={stripe} />
                  )}
                </ElementsConsumer>
              </Elements>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default StripePayment;
