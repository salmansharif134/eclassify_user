"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Loader2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Copy
} from "lucide-react";
import { buyerApi } from "@/utils/api";
import { toast } from "sonner";
import { useNavigate } from "@/components/Common/useNavigate";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import CustomImage from "@/components/Common/CustomImage";
import { formatPriceAbbreviated, formatDate } from "@/utils";

const BuyerOrderDetail = () => {
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
      const response = await buyerApi.getOrder(orderId);
      if (response.data.error === false) {
        setOrder(response.data.data?.order || response.data.data);
      } else {
        toast.error(response.data.message || "Failed to load order");
        navigate("/buyer-orders");
      }
    } catch (error) {
      console.error("Order detail error:", error);
      toast.error("Failed to load order details");
      navigate("/buyer-orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        component: <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Pending</Badge>,
        icon: <Clock size={16} />
      },
      processing: { 
        component: <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Processing</Badge>,
        icon: <Clock size={16} />
      },
      shipped: { 
        component: <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Shipped</Badge>,
        icon: <Truck size={16} />
      },
      delivered: { 
        component: <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Delivered</Badge>,
        icon: <CheckCircle2 size={16} />
      },
      cancelled: { 
        component: <Badge className="bg-red-500 hover:bg-red-600 text-white">Cancelled</Badge>,
        icon: <XCircle size={16} />
      },
      completed: { 
        component: <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Completed</Badge>,
        icon: <CheckCircle2 size={16} />
      },
    };
    return statusConfig[status?.toLowerCase()] || { 
      component: <Badge className="bg-slate-500 text-white">{status}</Badge>,
      icon: <Package size={16} />
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <Layout>
        <BreadCrumb title2="Order Details" />
        <div className="container mt-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <BreadCrumb title2="Order Details" />
        <div className="container mt-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package size={64} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order not found</h3>
              <Button onClick={() => navigate("/buyer-orders")}>Back to Orders</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const statusInfo = getStatusBadge(order.status);

  return (
    <Layout>
      <BreadCrumb title2="Order Details" />
      <div className="container mt-8 space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/buyer-orders")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold">Order Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Order #{order.order_number || order.id}</CardTitle>
                      {statusInfo.component}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar size={14} />
                      Placed on {formatDate(order.created_at)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold">
                      <DollarSign size={20} />
                      {formatPriceAbbreviated(order.total_amount || order.total)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <CustomImage
                          src={item.image || item.product?.image}
                          alt={item.name || item.product?.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg mb-1">
                          {item.name || item.product?.name || "Product"}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Quantity: {item.quantity || 1}
                        </p>
                        <p className="text-base font-medium">
                          {formatPriceAbbreviated((item.price || item.product?.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.shipping_address.full_name || order.shipping_address.name}</p>
                    <p className="text-muted-foreground">{order.shipping_address.address}</p>
                    {order.shipping_address.city && (
                      <p className="text-muted-foreground">
                        {order.shipping_address.city}
                        {order.shipping_address.state && `, ${order.shipping_address.state}`}
                        {order.shipping_address.zip_code && ` ${order.shipping_address.zip_code}`}
                      </p>
                    )}
                    {order.shipping_address.country && (
                      <p className="text-muted-foreground">{order.shipping_address.country}</p>
                    )}
                    {order.shipping_address.phone && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone size={14} />
                        {order.shipping_address.phone}
                      </p>
                    )}
                    {order.shipping_address.email && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Mail size={14} />
                        {order.shipping_address.email}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPriceAbbreviated(order.subtotal || order.total_amount || order.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {order.shipping_cost ? formatPriceAbbreviated(order.shipping_cost) : "Free"}
                  </span>
                </div>
                {order.tax && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatPriceAbbreviated(order.tax)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPriceAbbreviated(order.total_amount || order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.order_number || order.id}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(order.order_number || order.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{order.payment_method || "N/A"}</p>
                </div>
                {order.tracking_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.tracking_number}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.tracking_number)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {order.status === "delivered" && (
                <Button className="w-full" variant="outline">
                  Reorder
                </Button>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.print()}
              >
                Print Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerOrderDetail;
