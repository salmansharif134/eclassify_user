"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { Button } from "@/components/ui/button";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { Settings, Save, RefreshCw, Store, CreditCard, Truck, Receipt, Loader2, User, Mail, Phone, MapPin, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    storeName: "",
    email: "",
    phone: "",
    address: "",
    policy: "",
  });
  const [payment, setPayment] = useState({
    bankAccount: "",
    taxId: "",
  });
  const [shipping, setShipping] = useState({
    carrier: "",
    handlingTime: "",
    freeShipping: false,
  });
  const [tax, setTax] = useState({
    defaultRate: "",
    nexusStates: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSection, setSavingSection] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [meResponse, settingsResponse] = await Promise.all([
          sellerHubApi.getMe(),
          sellerHubApi.getSettings(),
        ]);
        const mePayload = meResponse?.data?.data ?? meResponse?.data;
        const settingsPayload = settingsResponse?.data?.data ?? settingsResponse?.data;
        if (isMounted) {
          setProfile({
            storeName: mePayload?.store_name || settingsPayload?.store_name || "",
            email: mePayload?.email || settingsPayload?.email || "",
            phone: settingsPayload?.phone || "",
            address: settingsPayload?.address || "",
            policy: settingsPayload?.policy || "",
          });
          setPayment({
            bankAccount: settingsPayload?.payment_method || "",
            taxId: settingsPayload?.tax_id || "",
          });
          setShipping({
            carrier: settingsPayload?.shipping_preferences?.carrier || "",
            handlingTime: settingsPayload?.shipping_preferences?.handling_time || "",
            freeShipping: Boolean(settingsPayload?.shipping_preferences?.free_shipping),
          });
          setTax({
            defaultRate: settingsPayload?.tax_settings?.default_rate || "",
            nexusStates: settingsPayload?.tax_settings?.nexus_states || "",
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load settings.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingSection("profile");
      await sellerHubApi.updateSettings({
        store_name: profile.storeName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        policy: profile.policy,
      });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveShipping = async () => {
    try {
      setSavingSection("shipping");
      await sellerHubApi.updateSettings({
        shipping_preferences: {
          carrier: shipping.carrier,
          handling_time: shipping.handlingTime,
          free_shipping: shipping.freeShipping,
        },
      });
      toast.success("Shipping preferences updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update shipping.");
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveTax = async () => {
    try {
      setSavingSection("tax");
      await sellerHubApi.updateSettings({
        tax_settings: {
          default_rate: tax.defaultRate,
          nexus_states: tax.nexusStates,
        },
      });
      toast.success("Tax settings updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update tax settings.");
    } finally {
      setSavingSection(null);
    }
  };

  const handleSavePayment = async () => {
    try {
      setSavingSection("payment");
      await sellerHubApi.updateSettings({
        payment_method: payment.bankAccount,
        tax_id: payment.taxId,
      });
      toast.success("Payment settings updated successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update payment settings.");
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Settings"
        description="Manage store profile, payment methods, shipping, and tax preferences."
      />

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>Store Profile</CardTitle>
            </div>
            <CardDescription>Manage your store information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Store Name
              </Label>
              <Input
                id="storeName"
                value={profile.storeName}
                onChange={(event) => setProfile((prev) => ({ ...prev, storeName: event.target.value }))}
                placeholder="Enter store name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Support Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="support@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Business Address
              </Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(event) => setProfile((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Return Policy
              </Label>
              <Textarea
                id="policy"
                value={profile.policy}
                onChange={(event) => setProfile((prev) => ({ ...prev, policy: event.target.value }))}
                placeholder="Describe your return policy..."
                rows={4}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isLoading || savingSection === "profile"}
              className="w-full gap-2"
            >
              {savingSection === "profile" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Payment Methods</CardTitle>
            </div>
            <CardDescription>Configure payment and payout settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="bankAccount" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Bank Account
              </Label>
              <Input
                id="bankAccount"
                value={payment.bankAccount}
                onChange={(event) => setPayment((prev) => ({ ...prev, bankAccount: event.target.value }))}
                placeholder="Bank account ending in 4821"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Tax ID
              </Label>
              <Input
                id="taxId"
                value={payment.taxId}
                onChange={(event) => setPayment((prev) => ({ ...prev, taxId: event.target.value }))}
                placeholder="Enter tax identification number"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleSavePayment} 
              disabled={isLoading || savingSection === "payment"}
              className="w-full gap-2"
            >
              {savingSection === "payment" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Payout Method
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Shipping Preferences</CardTitle>
            </div>
            <CardDescription>Set default shipping options and handling times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="carrier">Default Carrier</Label>
              <Input
                id="carrier"
                value={shipping.carrier}
                onChange={(event) => setShipping((prev) => ({ ...prev, carrier: event.target.value }))}
                placeholder="UPS, FedEx, USPS, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handlingTime">Handling Time (Days)</Label>
              <Input
                id="handlingTime"
                type="number"
                value={shipping.handlingTime}
                onChange={(event) =>
                  setShipping((prev) => ({ ...prev, handlingTime: event.target.value }))
                }
                placeholder="1-7 days"
                min="1"
                max="30"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border-2 p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Offer Free Shipping
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Highlight listings with free shipping to attract more buyers.
                </p>
              </div>
              <Switch
                checked={shipping.freeShipping}
                onCheckedChange={(value) =>
                  setShipping((prev) => ({ ...prev, freeShipping: value }))
                }
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleSaveShipping} 
              disabled={isLoading || savingSection === "shipping"}
              className="w-full gap-2"
            >
              {savingSection === "shipping" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Shipping Preferences
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle>Tax Settings</CardTitle>
            </div>
            <CardDescription>Configure tax rates and nexus states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="defaultRate">Default Tax Rate (%)</Label>
              <Input
                id="defaultRate"
                type="number"
                value={tax.defaultRate}
                onChange={(event) => setTax((prev) => ({ ...prev, defaultRate: event.target.value }))}
                placeholder="8.5"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nexusStates">Tax Nexus States</Label>
              <Input
                id="nexusStates"
                value={tax.nexusStates}
                onChange={(event) => setTax((prev) => ({ ...prev, nexusStates: event.target.value }))}
                placeholder="CA, NY, TX (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Enter state codes where you have tax nexus, separated by commas
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSaveTax} 
              disabled={isLoading || savingSection === "tax"}
              className="w-full gap-2"
            >
              {savingSection === "tax" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Tax Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
