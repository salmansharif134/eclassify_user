"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  MessageSquare, 
  Plus, 
  Mail, 
  Phone, 
  User, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "@/components/Common/useNavigate";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reducer/authSlice";
import { toast } from "sonner";
import CustomLink from "@/components/Common/CustomLink";
import Layout from "@/components/Layout/Layout";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { sellerDashboardApi } from "@/utils/api";

const SellerDashboard = () => {
  const { navigate } = useNavigate();
  const userData = useSelector(userSignUpData);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userData?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await sellerDashboardApi.getDashboard(userData.id);
        if (response.data.error === false) {
          setDashboardData(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to load dashboard");
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [userData?.id]);

  const getStatusBadge = (status) => {
    const badges = {
      active: <Badge className="bg-green-500">Active</Badge>,
      trial: <Badge className="bg-blue-500">Trial</Badge>,
      expired: <Badge className="bg-red-500">Expired</Badge>,
      listed: <Badge className="bg-green-500">Listed</Badge>,
      draft: <Badge className="bg-gray-500">Draft</Badge>,
      sold: <Badge className="bg-purple-500">Sold</Badge>,
      completed: <Badge className="bg-green-500">Completed</Badge>,
      processing: <Badge className="bg-yellow-500">Processing</Badge>,
      pending: <Badge className="bg-gray-500">Pending</Badge>
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <BreadCrumb title2="Seller Dashboard" />
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
      <BreadCrumb title2="Seller Dashboard" />
      <div className="container mt-8 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {dashboardData?.seller_info?.name}!</h1>
            <p className="text-muted-foreground mt-1">
              Manage your patents and track your marketplace activity
            </p>
          </div>
          <Button onClick={() => navigate("/seller-signup")} className="gap-2">
            <Plus size={20} />
            Add More Patents
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Patents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.patents?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.patents?.reduce((sum, p) => sum + (p.views || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.patents?.reduce((sum, p) => sum + (p.inquiries || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Membership Status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusBadge(dashboardData?.subscription?.status)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patents Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    My Patents
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate("/seller-signup")}>
                    <Plus size={16} className="mr-2" />
                    Add Patent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dashboardData?.patents?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.patents.map((patent) => (
                      <div
                        key={patent.id}
                        className="border rounded-lg p-4 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{patent.title}</h3>
                              {getStatusBadge(patent.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Patent #: {patent.patent_number}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Eye size={16} />
                                <span>{patent.views || 0} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare size={16} />
                                <span>{patent.inquiries || 0} inquiries</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No patents listed yet</p>
                    <Button onClick={() => navigate("/seller-signup")}>
                      <Plus size={16} className="mr-2" />
                      Add Your First Patent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  Service Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.service_orders?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.service_orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{order.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Ordered: {new Date(order.order_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          {order.status === "completed" && order.delivery_date && (
                            <span className="text-sm text-muted-foreground">
                              Delivered: {new Date(order.delivery_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No service orders yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Account Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Your Account Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.account_manager ? (
                  <>
                    <div>
                      <p className="font-semibold">{dashboardData.account_manager.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Here to help you succeed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} />
                        <a
                          href={`mailto:${dashboardData.account_manager.email}`}
                          className="text-primary hover:underline"
                        >
                          {dashboardData.account_manager.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} />
                        <a
                          href={`tel:${dashboardData.account_manager.phone}`}
                          className="text-primary hover:underline"
                        >
                          {dashboardData.account_manager.phone}
                        </a>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Schedule Meeting
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your account manager will be assigned soon
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Membership Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="font-semibold">{dashboardData?.subscription?.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(dashboardData?.subscription?.status)}
                  </div>
                </div>
                {dashboardData?.seller_info?.trial_end_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Trial Ends</p>
                    <p className="font-semibold">
                      {new Date(dashboardData.seller_info.trial_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {dashboardData?.subscription?.next_billing_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing</p>
                    <p className="font-semibold">
                      {new Date(dashboardData.subscription.next_billing_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate("/subscription")}>
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/seller-signup")}>
                  <Plus size={16} className="mr-2" />
                  Add New Patent
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/subscription")}>
                  <FileText size={16} className="mr-2" />
                  View Plans
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/profile")}>
                  <User size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
