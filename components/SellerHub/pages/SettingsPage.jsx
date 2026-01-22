"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { storeProfile } from "@/components/SellerHub/sellerHubData";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Settings"
        description="Manage store profile, payment methods, shipping, and tax preferences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input defaultValue={storeProfile.name} placeholder="Store name" />
            <Input defaultValue={storeProfile.email} placeholder="Support email" />
            <Input defaultValue={storeProfile.phone} placeholder="Phone number" />
            <Input defaultValue={storeProfile.address} placeholder="Business address" />
            <Textarea defaultValue={storeProfile.policy} placeholder="Return policy" rows={4} />
            <Button>Save profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Bank account ending in 4821" />
            <Input placeholder="Tax ID" />
            <Button variant="outline">Update payout method</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Default carrier (e.g. UPS, FedEx)" />
            <Input placeholder="Handling time (days)" />
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Offer free shipping
                </p>
                <p className="text-xs text-muted-foreground">
                  Highlight listings with free shipping.
                </p>
              </div>
              <Switch />
            </div>
            <Button variant="outline">Save shipping</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Default tax rate (%)" />
            <Input placeholder="Tax nexus states" />
            <Button variant="outline">Save tax settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
