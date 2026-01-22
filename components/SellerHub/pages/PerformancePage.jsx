"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { performanceMetrics, revenueSeries } from "@/components/SellerHub/sellerHubData";
import { Progress } from "@/components/ui/progress";
import SalesChart from "@/components/SellerHub/SalesChart";

const PerformancePage = () => {
  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Performance"
        description="Track seller metrics and stay within marketplace targets."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {performanceMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle className="text-base">{metric.label}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Target: under {metric.target}%
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-semibold">{metric.value}%</div>
              <Progress value={(metric.value / metric.target) * 100} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Volume Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recent revenue movement across the last 4 weeks.
          </p>
        </CardHeader>
        <CardContent>
          <SalesChart data={revenueSeries.weekly} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;
