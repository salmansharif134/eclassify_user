"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { Progress } from "@/components/ui/progress";
import SalesChart from "@/components/SellerHub/SalesChart";
import { sellerHubApi } from "@/utils/api";
import { useSearchParams } from "next/navigation";

const PerformancePage = () => {
  const searchParams = useSearchParams();
  const [metrics, setMetrics] = useState([]);
  const [series, setSeries] = useState({ weekly: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchPerformance = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getPerformance({ query: query || undefined });
        const payload = response?.data?.data ?? response?.data;
        if (isMounted) {
          setMetrics(payload?.performanceMetrics || payload?.metrics || []);
          setSeries(payload?.revenueSeries || payload?.series || { weekly: [] });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load performance metrics.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchPerformance();
    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Performance"
        description="Track seller metrics and stay within marketplace targets."
      />

      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {metrics.map((metric) => (
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
        {!isLoading && metrics.length === 0 && (
          <Card className="lg:col-span-3">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No performance data available.
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Volume Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Recent revenue movement across the last 4 weeks.
          </p>
        </CardHeader>
        <CardContent>
          <SalesChart data={series.weekly || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;
