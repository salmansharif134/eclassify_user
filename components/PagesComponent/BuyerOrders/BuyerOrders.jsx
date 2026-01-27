"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Loader2,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Search,
  Filter
} from "lucide-react";
import { buyerApi } from "@/utils/api";
import { toast } from "sonner";
import { useNavigate } from "@/components/Common/useNavigate";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import CustomImage from "@/components/Common/CustomImage";
import { formatPriceAbbreviated, formatDate } from "@/utils";

const BuyerOrders = () => {
  const { navigate } = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setPage(1);
    setOrders([]);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        perPage: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { query: searchQuery })
      };
      const response = await buyerApi.getOrders(params);
      if (response.data.error === false) {
        const newOrders = response.data.data?.orders || [];
        if (page === 1) {
          setOrders(newOrders);
        } else {
          setOrders((prev) => [...prev, ...newOrders]);
        }
        setHasMore(response.data.data?.has_more || false);
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Orders error:", error);
      toast.error("Failed to load orders");
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

  if (loading && orders.length === 0) {
    return (
      <Layout>
        <BreadCrumb title2="My Orders" />
        <div className="container mt-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BreadCrumb title2="My Orders" />
      <div className="container mt-8 space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search orders by order number or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag size={64} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Button onClick={() => navigate("/")}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Order #{order.order_number || order.id}</CardTitle>
                          {statusInfo.component}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar size={14} />
                          {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                          <DollarSign size={20} />
                          {formatPriceAbbreviated(order.total_amount)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 border-b pb-3 last:border-0">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <CustomImage
                              src={item.image || item.product?.image}
                              alt={item.name || item.product?.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {item.name || item.product?.name || "Product"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity || 1}
                            </p>
                            <p className="text-sm font-medium">
                              {formatPriceAbbreviated(item.price || item.product?.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-3">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/buyer-orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button variant="outline">
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BuyerOrders;
