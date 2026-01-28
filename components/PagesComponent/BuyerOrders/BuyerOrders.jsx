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
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Debug logging on mount
  useEffect(() => {
    console.log("BuyerOrders component mounted");
    console.log("Initial state:", { loading, orders: orders.length, page, statusFilter, searchQuery });
  }, []);

  useEffect(() => {
    setPage(1);
    setOrders([]);
  }, [statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { 
        page, 
        perPage: 10,
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(searchQuery && { query: searchQuery })
      };
      
      console.log("=== BuyerOrders Debug ===");
      console.log("1. Fetching orders with params:", params);
      console.log("2. API endpoint:", "buyer/orders");
      console.log("3. Current auth token:", typeof window !== 'undefined' ? localStorage.getItem('token')?.substring(0, 20) + '...' : 'N/A');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout after 30 seconds")), 30000)
      );
      
      const apiCall = buyerApi.getOrders(params);
      console.log("4. API call initiated");
      
      const response = await Promise.race([
        apiCall,
        timeoutPromise
      ]);
      
      console.log("5. API response received:", response);
      console.log("6. Response structure:", {
        hasData: !!response?.data,
        hasError: response?.data?.error,
        hasOrders: !!response?.data?.data?.orders,
        ordersCount: response?.data?.data?.orders?.length || 0,
        hasPagination: !!response?.data?.data?.pagination
      });
      
      // Handle different response structures
      if (!response || !response.data) {
        console.error("Invalid response structure:", response);
        toast.error("Invalid response from server");
        if (page === 1) {
          setOrders([]);
        }
        return;
      }
      
      // Check response structure - backend returns: { error: false, data: { orders: [], pagination: {} } }
      if (response.data && response.data.error === false) {
        // Extract orders from response.data.data.orders
        const responseData = response.data.data || {};
        const newOrders = Array.isArray(responseData.orders) ? responseData.orders : [];
        
        console.log("7. Parsed orders:", newOrders);
        console.log("8. Orders count:", newOrders.length);
        console.log("9. First order sample:", newOrders[0] || "No orders");
        console.log("9b. Full response data:", responseData);
        
        // Validate and set orders
        if (Array.isArray(newOrders)) {
          if (page === 1) {
            setOrders(newOrders);
          } else {
            setOrders((prev) => [...prev, ...newOrders]);
          }
        } else {
          console.error("Orders is not an array:", newOrders);
          setOrders([]);
        }
        
        // Check if there are more pages based on pagination data
        const pagination = responseData.pagination || {};
        const hasMorePages = pagination.current_page && pagination.last_page 
          ? pagination.current_page < pagination.last_page 
          : false;
        setHasMore(hasMorePages);
        
        console.log("10. Pagination:", { 
          current: pagination.current_page, 
          last: pagination.last_page, 
          hasMore: hasMorePages,
          total: pagination.total
        });
        console.log("=== Fetch Complete Successfully ===");
      } else {
        console.error("7. API returned error:", response.data);
        console.error("Error message:", response.data?.message);
        toast.error(response.data?.message || "Failed to load orders");
        setError(response.data?.message || "Failed to load orders");
        // Set empty orders on error
        if (page === 1) {
          setOrders([]);
        }
      }
    } catch (error) {
      console.error("Orders error:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load orders";
      setError(errorMessage);
      toast.error(errorMessage);
      // Set empty orders on error to prevent showing stale data
      if (page === 1) {
        setOrders([]);
      }
    } finally {
      // Always clear loading state
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadOrders = async () => {
      if (isMounted) {
        await fetchOrders();
      }
    };
    
    loadOrders();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchQuery]);

  // Debug render - MUST be before any early returns
  useEffect(() => {
    console.log("Component render state:", {
      loading,
      ordersCount: orders.length,
      error,
      hasMore,
      page
    });
  }, [loading, orders.length, error, hasMore, page]);

  const getStatusBadge = (status) => {
    if (!status) {
      return { 
        component: <Badge className="bg-slate-500 text-white">Unknown</Badge>,
        icon: <Package size={16} />
      };
    }
    
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
    
    const statusLower = String(status).toLowerCase();
    return statusConfig[statusLower] || { 
      component: <Badge className="bg-slate-500 text-white">{String(status)}</Badge>,
      icon: <Package size={16} />
    };
  };

  if (loading && orders.length === 0 && !error) {
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

  // Show error state if there's an error and no orders
  if (error && orders.length === 0 && !loading) {
    return (
      <Layout>
        <BreadCrumb title2="My Orders" />
        <div className="container mt-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle size={64} className="text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Orders</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => {
                setError(null);
                setPage(1);
                fetchOrders();
              }}>
                Try Again
              </Button>
            </CardContent>
          </Card>
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
                    <SelectItem value="all">All Status</SelectItem>
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
              // More lenient validation - accept orders with either id or order_id
              if (!order || (!order.id && !order.order_id)) {
                console.warn("Skipping invalid order:", order);
                return null; // Skip invalid orders
              }
              const statusInfo = getStatusBadge(order.status);
              return (
                <Card key={order.id || order.order_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Order {order.id || `#${order.order_id}`}</CardTitle>
                          {statusInfo.component}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar size={14} />
                          {(() => {
                            try {
                              const date = order.placed_at || order.created_at;
                              return date ? formatDate(date) : "N/A";
                            } catch (e) {
                              console.error("Error formatting date:", e, order);
                              return "N/A";
                            }
                          })()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                          <DollarSign size={20} />
                          {(() => {
                            try {
                              return formatPriceAbbreviated(order.total_amount || 0);
                            } catch (e) {
                              console.error("Error formatting price:", e, order);
                              return "$0.00";
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items && order.items.length > 0 ? order.items.map((item, index) => {
                        // Safely get image - handle both array and string formats
                        const rawImage = item.image || 
                          (item.product?.images && Array.isArray(item.product.images) 
                            ? item.product.images[0] 
                            : item.product?.images) ||
                          item.product?.image;
                        // Ensure empty strings are converted to null to avoid Next.js Image warnings
                        const itemImage = (rawImage && typeof rawImage === 'string' && rawImage.trim()) 
                          ? rawImage.trim() 
                          : (rawImage || null);
                        
                        // Safely get product name
                        const itemName = item.product?.title || 
                          item.name || 
                          item.product?.name || 
                          "Product";
                        
                        return (
                          <div key={item.id || index} className="flex items-center gap-4 border-b pb-3 last:border-0">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <CustomImage
                                src={itemImage}
                                alt={itemName}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">
                                {itemName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity || 1}
                              </p>
                              <p className="text-sm font-medium">
                                {(() => {
                                  try {
                                    return formatPriceAbbreviated(item.price || item.product?.price || 0);
                                  } catch (e) {
                                    console.error("Error formatting item price:", e, item);
                                    return "$0.00";
                                  }
                                })()}
                              </p>
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-sm text-muted-foreground py-2">No items in this order</p>
                      )}
                      <div className="flex items-center justify-between pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              // Extract order ID - prioritize order_id, then extract from id
                              let orderId = null;
                              
                              if (order.order_id) {
                                orderId = String(order.order_id);
                              } else if (order.id) {
                                const idStr = String(order.id);
                                // Remove 'ORD-' prefix if present
                                orderId = idStr.replace(/^ORD-/i, '');
                              }
                              
                              console.log("View Details clicked:", { order, extractedOrderId: orderId });
                              
                              if (orderId) {
                                const targetPath = `/buyer-orders/${orderId}`;
                                console.log("Navigating to:", targetPath);
                                navigate(targetPath);
                              } else {
                                console.error("Invalid order ID:", order);
                                toast.error("Invalid order ID. Please try again.");
                              }
                            } catch (e) {
                              console.error("Error navigating to order details:", e, order);
                              toast.error("Error opening order details");
                            }
                          }}
                        >
                          View Details
                        </Button>
                        {(order.status?.toLowerCase() === "delivered" || order.status?.toLowerCase() === "completed") && (
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
