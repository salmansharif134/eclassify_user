"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2,
  ShoppingCart,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Plus,
  Minus,
  Trash2
} from "lucide-react";
import { buyerApi, allItemApi } from "@/utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useNavigate } from "@/components/Common/useNavigate";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import CustomImage from "@/components/Common/CustomImage";
import { formatPriceAbbreviated } from "@/utils";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";
import StripePayment from "@/components/PagesComponent/Subscription/StripePayment";

const Checkout = () => {
  const { navigate } = useNavigate();
  const searchParams = useSearchParams();
  const userData = useSelector(userSignUpData);
  const productId = searchParams.get("product_id");
  const productSlug = searchParams.get("product_slug");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    full_name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.mobile || "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [updatingCart, setUpdatingCart] = useState({});

  useEffect(() => {
    if (productId || productSlug) {
      // Single product checkout
      fetchProductForCheckout();
    } else {
      // Cart checkout
      fetchCart();
    }
  }, [productId, productSlug]);

  const fetchProductForCheckout = async () => {
    try {
      setLoading(true);
      // Fetch product details by slug (preferred) or ID
      const params = productSlug ? { slug: productSlug } : { id: productId };
      const response = await allItemApi.getItems(params);
      if (response.data.error === false && response.data.data?.data?.length > 0) {
        const item = response.data.data.data[0];
        
        // Check if item has a product_id (required for checkout)
        if (!item.product_id) {
          toast.error("This item cannot be purchased directly. Please contact the seller.");
          navigate("/");
          return;
        }
        
        setCart([{
          id: item.id,
          product_id: item.product_id, // Use the actual product_id from products table, not item.id
          name: item.translated_item?.name || item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
          product: item
        }]);
      } else {
        toast.error("Product not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await buyerApi.getCart();
      if (response.data.error === false) {
        setCart(response.data.data?.items || []);
      } else {
        toast.error(response.data.message || "Failed to load cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdatingCart((prev) => ({ ...prev, [itemId]: true }));
      const response = await buyerApi.updateCartItem(itemId, {
        quantity: newQuantity,
      });
      
      if (response.data.error === false) {
        setCart((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        toast.success("Cart updated");
      } else {
        toast.error(response.data.message || "Failed to update cart");
        fetchCart(); // Refresh cart on error
      }
    } catch (error) {
      console.error("Update cart error:", error);
      toast.error("Failed to update cart");
      fetchCart(); // Refresh cart on error
    } finally {
      setUpdatingCart((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingCart((prev) => ({ ...prev, [itemId]: true }));
      const response = await buyerApi.removeFromCart(itemId);
      
      if (response.data.error === false) {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Item removed from cart");
      } else {
        toast.error(response.data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Remove cart error:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingCart((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleQuantityChange = (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      handleUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleInputChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    // Validate shipping info - all fields are required by backend
    if (!shippingInfo.full_name || !shippingInfo.email || !shippingInfo.phone || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || 
        !shippingInfo.zip_code || !shippingInfo.country) {
      toast.error("Please fill in all required shipping information");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setSubmitting(true);
      
      // Validate that all cart items have valid product_id
      const invalidItems = cart.filter(item => !item.product_id);
      if (invalidItems.length > 0) {
        toast.error("Some items in your cart are invalid. Please remove them and try again.");
        return;
      }
      
      // Create order with payment intent - payment is required before order is confirmed
      // Map zip_code to zip as expected by backend API
      const shippingInfoForApi = {
        ...shippingInfo,
        zip: shippingInfo.zip_code, // Backend expects 'zip' not 'zip_code'
      };
      // Remove zip_code from the object since we're using zip
      delete shippingInfoForApi.zip_code;
      
      const checkoutData = {
        items: cart.map(item => ({
          product_id: item.product_id, // Must be a valid product_id from products table
          quantity: item.quantity || 1,
        })),
        shipping_info: shippingInfoForApi,
        payment_method: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1), // Backend expects capitalized (e.g., "Stripe" not "stripe")
      };

      const response = await buyerApi.checkout(checkoutData);
      
      if (response.data.error === false) {
        const orderData = response.data.data;
        
        // Check for client_secret in different possible locations
        // Backend returns it as: payment_intent.payment_gateway_response.client_secret for Stripe
        const clientSecret = 
          orderData.payment_intent?.client_secret || 
          orderData.payment_intent?.payment_gateway_response?.client_secret;
        
        if (clientSecret) {
          // Payment is required - show payment form
          setClientSecret(clientSecret);
          setOrderSummary(orderData.order_summary);
          // Store order ID for navigation after payment success
          // Backend returns order_id (single) or order_ids (array), use the first one
          const firstOrderId = orderData.order_id || (orderData.order_ids && orderData.order_ids[0]) || 
            (orderData.orders && orderData.orders[0]?.order_id) ||
            (orderData.orders && orderData.orders[0]?.id?.replace(/^ORD-/i, ''));
          setOrderId(firstOrderId);
          setShowPaymentForm(true);
          toast.info("Please complete payment to confirm your order");
        } else {
          // Log the response structure for debugging
          console.error("Payment setup failed - Response structure:", {
            payment_intent: orderData.payment_intent,
            has_payment_intent: !!orderData.payment_intent,
            payment_method: paymentMethod,
            full_response: orderData
          });
          
          // Check if payment intent exists but client_secret is missing
          if (orderData.payment_intent) {
            toast.error("Payment setup incomplete. The payment gateway may not be properly configured. Please contact support or try again.");
          } else {
            // Payment intent creation likely failed on backend
            toast.error("Payment setup failed. This may be due to payment gateway configuration issues. Please try again or contact support.");
          }
        }
      } else {
        toast.error(response.data.message || "Failed to process checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to process checkout";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    toast.success("Payment successful! Your order has been confirmed.");
    // Navigate to order details page after a short delay to show success message
    setTimeout(() => {
      // Use stored orderId, or try to extract from paymentIntent metadata
      let targetOrderId = orderId;
      
      if (!targetOrderId && paymentIntent?.metadata) {
        // Try to get order ID from payment intent metadata if available
        targetOrderId = paymentIntent.metadata.order_id || 
                       paymentIntent.metadata.transaction_id;
      }
      
      if (targetOrderId) {
        // Remove 'ORD-' prefix if present to get numeric ID
        const numericOrderId = String(targetOrderId).replace(/^ORD-/i, '');
        navigate(`/buyer-orders/${numericOrderId}`);
      } else {
        // Fallback to orders list if order ID is not available
        console.warn("Order ID not found, redirecting to orders list");
        navigate("/buyer-orders");
      }
    }, 1500);
  };

  if (loading) {
    return (
      <Layout>
        <BreadCrumb title2="Checkout" />
        <div className="container mt-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0 && !productId) {
    return (
      <Layout>
        <BreadCrumb title2="Checkout" />
        <div className="container mt-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart size={64} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <Button onClick={() => navigate("/")}>Continue Shopping</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const total = calculateTotal();

  return (
    <Layout>
      <BreadCrumb title2="Checkout" />
      <div className="container mt-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={20} />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="requiredInputLabel">Full Name</Label>
                    <Input
                      value={shippingInfo.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label className="requiredInputLabel">Email</Label>
                    <Input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <Label className="requiredInputLabel">Phone</Label>
                    <Input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label className="requiredInputLabel">Country</Label>
                    <Input
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="Enter country"
                      required
                    />
                  </div>
                  <div>
                    <Label className="requiredInputLabel">State</Label>
                    <Input
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                  <div>
                    <Label className="requiredInputLabel">City</Label>
                    <Input
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="requiredInputLabel">Address</Label>
                    <Input
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your full address"
                      required
                    />
                  </div>
                  <div>
                    <Label className="requiredInputLabel">Zip Code</Label>
                    <Input
                      value={shippingInfo.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="Enter zip code"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            {!showPaymentForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span>Credit/Debit Card (Stripe)</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Form */}
            {showPaymentForm && clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Complete Payment to Confirm Order
                  </CardTitle>
                  <CardDescription>
                    Your order will be confirmed only after successful payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StripePayment
                    clientSecretOverride={clientSecret}
                    onPaymentSuccess={handlePaymentSuccess}
                    amountDue={orderSummary?.total_amount || total}
                    billingDetails={{
                      name: shippingInfo.full_name,
                      email: shippingInfo.email,
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item, index) => {
                    const itemId = item.id;
                    const quantity = item.quantity || 1;
                    const price = item.price || item.product?.price || 0;
                    const isUpdating = updatingCart[itemId];
                    const isSingleProduct = !!(productId || productSlug);

                    return (
                      <div key={index} className="flex items-center gap-3 pb-3 border-b last:border-0">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <CustomImage
                            src={item.image || item.product?.image}
                            alt={item.name || item.product?.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.name || item.product?.name || "Product"}
                          </p>
                          {!isSingleProduct && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 border rounded">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleQuantityChange(itemId, quantity, -1)}
                                  disabled={isUpdating || quantity <= 1}
                                >
                                  <Minus size={12} />
                                </Button>
                                <span className="text-xs px-2 min-w-[24px] text-center">{quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleQuantityChange(itemId, quantity, 1)}
                                  disabled={isUpdating}
                                >
                                  <Plus size={12} />
                                </Button>
                              </div>
                              {isUpdating && (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          )}
                          {isSingleProduct && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Qty: {quantity}
                            </p>
                          )}
                          <p className="text-sm font-semibold mt-1">
                            {formatPriceAbbreviated(price * quantity)}
                          </p>
                        </div>
                        {!isSingleProduct && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(itemId)}
                            disabled={isUpdating}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatPriceAbbreviated(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>{formatPriceAbbreviated(total)}</span>
                  </div>
                </div>
                {!showPaymentForm && (
                  <>
                    <Button
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Payment is required to confirm your order
                    </p>
                  </>
                )}
                {showPaymentForm && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    <p>Complete payment to confirm your order</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
