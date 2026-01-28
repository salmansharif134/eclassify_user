"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { useNavigate } from "@/components/Common/useNavigate";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import CustomImage from "@/components/Common/CustomImage";
import { formatPriceAbbreviated, formatDate } from "@/utils";

const OrderDetailPage = () => {
  const { navigate } = useNavigate();
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      // Remove 'ORD-' prefix if present
      const numericOrderId = String(orderId).replace(/^ORD-/i, '');
      const response = await sellerHubApi.getOrder(numericOrderId);
      const payload = response?.data?.data ?? response?.data;
      setOrder(payload || null);
    } catch (error) {
      console.error("Order detail error:", error);
      toast.error(error?.response?.data?.message || "Failed to load order details");
      navigate("/seller-dashboard/orders");
    } finally {
      setLoading(false);
    }
  };

  // Parse shipping address - handle both JSON string and object
  const parseShippingAddress = (shippingAddress) => {
    if (!shippingAddress) return null;
    
    try {
      // If it's already an object, return it
      if (typeof shippingAddress === 'object') {
        return shippingAddress;
      }
      
      // If it's a string, try to parse it as JSON
      if (typeof shippingAddress === 'string') {
        // Check if it looks like JSON
        if (shippingAddress.trim().startsWith('{')) {
          return JSON.parse(shippingAddress);
        }
        // If it's not JSON, return as is (plain text address)
        return { address: shippingAddress };
      }
      
      return null;
    } catch (e) {
      console.error("Error parsing shipping address:", e);
      // If parsing fails, return as plain text
      return { address: shippingAddress };
    }
  };

  const formatShippingAddress = (shippingAddress) => {
    const parsed = parseShippingAddress(shippingAddress);
    if (!parsed) return "No shipping address provided";
    
    const parts = [];
    if (parsed.full_name) parts.push(parsed.full_name);
    if (parsed.address) parts.push(parsed.address);
    if (parsed.city) parts.push(parsed.city);
    if (parsed.state) parts.push(parsed.state);
    if (parsed.zip || parsed.zip_code) parts.push(parsed.zip || parsed.zip_code);
    if (parsed.country) parts.push(parsed.country);
    
    return parts.length > 0 ? parts.join(", ") : "No shipping address provided";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SellerHubPageHeader
          title="Order Details"
          description="View order information and buyer details."
        />
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={48} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <SellerHubPageHeader
          title="Order Details"
          description="View order information and buyer details."
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Order not found</p>
            <Button onClick={() => navigate("/seller-dashboard/orders")}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shippingAddress = parseShippingAddress(order.shipping_address);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Order Details"
          description="View order information and buyer details."
        />
        <Button
          variant="outline"
          onClick={() => navigate("/seller-dashboard/orders")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <div className="mt-1">{getStatusBadge(order.payment)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placed</p>
                  <p className="font-semibold">
                    {order.date || order.placed_at ? formatDate(order.date || order.placed_at) : "N/A"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">
                    {formatPriceAbbreviated(order.total || order.total_amount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {item.image || item.product?.image ? (
                          <CustomImage
                            src={item.image || item.product?.image}
                            alt={item.title || item.name || "Product"}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <MapPin size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {item.title || item.name || "Product"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity || 1}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {formatPriceAbbreviated(item.price || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPriceAbbreviated((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Buyer & Shipping Info */}
        <div className="space-y-6">
          {/* Buyer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Buyer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{order.buyer || "N/A"}</p>
              </div>
              {shippingAddress?.email && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail size={14} />
                    Email
                  </p>
                  <p className="font-semibold">{shippingAddress.email}</p>
                </div>
              )}
              {shippingAddress?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone size={14} />
                    Phone
                  </p>
                  <p className="font-semibold">{shippingAddress.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {shippingAddress ? (
                  <>
                    {shippingAddress.full_name && (
                      <p className="font-semibold">{shippingAddress.full_name}</p>
                    )}
                    {shippingAddress.address && (
                      <p>{shippingAddress.address}</p>
                    )}
                    <p>
                      {[
                        shippingAddress.city,
                        shippingAddress.state,
                        shippingAddress.zip || shippingAddress.zip_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {shippingAddress.country && (
                      <p className="font-medium">{shippingAddress.country}</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No shipping address provided</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
