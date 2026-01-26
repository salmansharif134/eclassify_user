"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { Button } from "@/components/ui/button";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";

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
      await sellerHubApi.updateSettings({
        store_name: profile.storeName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        policy: profile.policy,
      });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleSaveShipping = async () => {
    try {
      await sellerHubApi.updateSettings({
        shipping_preferences: {
          carrier: shipping.carrier,
          handling_time: shipping.handlingTime,
          free_shipping: shipping.freeShipping,
        },
      });
      toast.success("Shipping preferences updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update shipping.");
    }
  };

  const handleSaveTax = async () => {
    try {
      await sellerHubApi.updateSettings({
        tax_settings: {
          default_rate: tax.defaultRate,
          nexus_states: tax.nexusStates,
        },
      });
      toast.success("Tax settings updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update tax settings.");
    }
  };

  const handleSavePayment = async () => {
    try {
      await sellerHubApi.updateSettings({
        payment_method: payment.bankAccount,
        tax_id: payment.taxId,
      });
      toast.success("Payment settings updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update payment settings.");
    }
  };

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Settings"
        description="Manage store profile, payment methods, shipping, and tax preferences."
      />

      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={profile.storeName}
              onChange={(event) => setProfile((prev) => ({ ...prev, storeName: event.target.value }))}
              placeholder="Store name"
            />
            <Input
              value={profile.email}
              onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Support email"
            />
            <Input
              value={profile.phone}
              onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Phone number"
            />
            <Input
              value={profile.address}
              onChange={(event) => setProfile((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Business address"
            />
            <Textarea
              value={profile.policy}
              onChange={(event) => setProfile((prev) => ({ ...prev, policy: event.target.value }))}
              placeholder="Return policy"
              rows={4}
            />
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={payment.bankAccount}
              onChange={(event) => setPayment((prev) => ({ ...prev, bankAccount: event.target.value }))}
              placeholder="Bank account ending in 4821"
            />
            <Input
              value={payment.taxId}
              onChange={(event) => setPayment((prev) => ({ ...prev, taxId: event.target.value }))}
              placeholder="Tax ID"
            />
            <Button variant="outline" onClick={handleSavePayment} disabled={isLoading}>
              Update payout method
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={shipping.carrier}
              onChange={(event) => setShipping((prev) => ({ ...prev, carrier: event.target.value }))}
              placeholder="Default carrier (e.g. UPS, FedEx)"
            />
            <Input
              value={shipping.handlingTime}
              onChange={(event) =>
                setShipping((prev) => ({ ...prev, handlingTime: event.target.value }))
              }
              placeholder="Handling time (days)"
            />
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Offer free shipping
                </p>
                <p className="text-xs text-muted-foreground">
                  Highlight listings with free shipping.
                </p>
              </div>
              <Switch
                checked={shipping.freeShipping}
                onCheckedChange={(value) =>
                  setShipping((prev) => ({ ...prev, freeShipping: value }))
                }
              />
            </div>
            <Button variant="outline" onClick={handleSaveShipping} disabled={isLoading}>
              Save shipping
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={tax.defaultRate}
              onChange={(event) => setTax((prev) => ({ ...prev, defaultRate: event.target.value }))}
              placeholder="Default tax rate (%)"
            />
            <Input
              value={tax.nexusStates}
              onChange={(event) => setTax((prev) => ({ ...prev, nexusStates: event.target.value }))}
              placeholder="Tax nexus states"
            />
            <Button variant="outline" onClick={handleSaveTax} disabled={isLoading}>
              Save tax settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
