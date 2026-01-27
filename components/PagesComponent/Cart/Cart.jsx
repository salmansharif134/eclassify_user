"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag
} from "lucide-react";
import { buyerApi } from "@/utils/api";
import { toast } from "sonner";
import { useNavigate } from "@/components/Common/useNavigate";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import CustomImage from "@/components/Common/CustomImage";
import { formatPriceAbbreviated } from "@/utils";

const Cart = () => {
  const { navigate } = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

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
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
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
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
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
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleQuantityChange = (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      handleUpdateQuantity(itemId, newQuantity);
    }
  };

  if (loading) {
    return (
      <Layout>
        <BreadCrumb title2="Shopping Cart" />
        <div className="container mt-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        </div>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <BreadCrumb title2="Shopping Cart" />
        <div className="container mt-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart size={64} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Start shopping to add items to your cart</p>
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
      <BreadCrumb title2="Shopping Cart" />
      <div className="container mt-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <span className="text-muted-foreground">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const itemId = item.id;
              const quantity = item.quantity || 1;
              const price = item.price || item.product?.price || 0;
              const isUpdating = updating[itemId];

              return (
                <Card key={itemId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <CustomImage
                          src={item.image || item.product?.image}
                          alt={item.name || item.product?.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/ad-details/${item.product?.slug || item.slug}`)}
                        >
                          {item.name || item.product?.name || "Product"}
                        </h3>
                        <p className="text-lg font-bold text-primary mb-3">
                          {formatPriceAbbreviated(price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(itemId, quantity, -1)}
                              disabled={isUpdating || quantity <= 1}
                            >
                              <Minus size={16} />
                            </Button>
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1;
                                if (newQty > 0) {
                                  handleUpdateQuantity(itemId, newQty);
                                }
                              }}
                              className="w-16 text-center border-0 h-8"
                              min="1"
                              disabled={isUpdating}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(itemId, quantity, 1)}
                              disabled={isUpdating}
                            >
                              <Plus size={16} />
                            </Button>
                          </div>

                          {isUpdating && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}

                          <div className="ml-auto flex items-center gap-4">
                            <p className="font-semibold text-lg">
                              {formatPriceAbbreviated(price * quantity)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(itemId)}
                              disabled={isUpdating}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPriceAbbreviated(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPriceAbbreviated(total)}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate("/checkout")}
                  size="lg"
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
