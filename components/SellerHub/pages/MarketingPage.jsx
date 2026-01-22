"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { campaigns } from "@/components/SellerHub/sellerHubData";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { Progress } from "@/components/ui/progress";

const MarketingPage = () => {
  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Marketing"
        description="Run promotions to boost visibility and sales."
        actionLabel="Create campaign"
        onAction={() => {}}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recommended actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Launch a sponsored listings boost for top-selling items.</p>
            <p>Bundle inventory that has been in stock for 60+ days.</p>
            <Button className="w-full">View insights</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Buyer engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Listing impressions</p>
              <p className="text-2xl font-semibold text-slate-900">28,400</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion rate</p>
              <p className="text-2xl font-semibold text-slate-900">3.8%</p>
            </div>
            <Button variant="outline">View report</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Promotions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Active offers</p>
              <p className="text-2xl font-semibold text-slate-900">2</p>
            </div>
            <Button variant="outline">Manage offers</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{campaign.id}</p>
                  <p className="text-base font-semibold text-slate-900">{campaign.title}</p>
                </div>
                {getStatusBadge(campaign.status)}
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Budget</span>
                  <span>${campaign.budget}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Spent</span>
                  <span>${campaign.spent}</span>
                </div>
                <Progress value={(campaign.spent / campaign.budget) * 100} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  View details
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingPage;
