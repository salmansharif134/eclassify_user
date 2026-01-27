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
  const [updatingCart, setUpdatingCart] = useState({});

  useEffect(() => {
    if (productId) {
      // Single product checkout
      fetchProductForCheckout();
    } else {
      // Cart checkout
      fetchCart();
    }
  }, [productId]);

  const fetchProductForCheckout = async () => {
    try {
      setLoading(true);
      // Fetch product details by ID
      const response = await allItemApi.getItems({ id: productId });
      if (response.data.error === false && response.data.data?.data?.length > 0) {
        const product = response.data.data.data[0];
        setCart([{
          id: product.id,
          product_id: product.id,
          name: product.translated_item?.name || product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          product: product
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
    // Validate shipping info
    if (!shippingInfo.full_name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
      toast.error("Please fill in all required shipping information");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create order with payment intent
      const checkoutData = {
        items: cart.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity || 1,
        })),
        shipping_info: shippingInfo,
        payment_method: paymentMethod,
      };

      const response = await buyerApi.checkout(checkoutData);
      
      if (response.data.error === false) {
        const orderData = response.data.data;
        
        if (orderData.payment_intent?.client_secret) {
          setClientSecret(orderData.payment_intent.client_secret);
          setOrderSummary(orderData.order_summary);
          setShowPaymentForm(true);
        } else {
          // Order created without payment (free items or different flow)
          toast.success("Order placed successfully!");
          navigate("/buyer-orders");
        }
      } else {
        toast.error(response.data.message || "Failed to process checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process checkout");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! Order placed.");
    navigate("/buyer-orders");
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
                    <Label>Country</Label>
                    <Input
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter city"
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
                    <Label>Zip Code</Label>
                    <Input
                      value={shippingInfo.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="Enter zip code"
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
                  <CardTitle>Complete Payment</CardTitle>
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
                    const isSingleProduct = !!productId;

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
                      "Place Order"
                    )}
                  </Button>
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
