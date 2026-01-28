"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { Progress } from "@/components/ui/progress";
import SalesChart from "@/components/SellerHub/SalesChart";
import { sellerHubApi } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { RefreshCw, TrendingUp, TrendingDown, Target, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const PerformancePage = () => {
  const searchParams = useSearchParams();
  const [metrics, setMetrics] = useState([]);
  const [series, setSeries] = useState({ weekly: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const response = await sellerHubApi.getPerformance({ query: query || undefined });
    const payload = response?.data?.data ?? response?.data;
    setMetrics(payload?.performanceMetrics || payload?.metrics || []);
    setSeries(payload?.revenueSeries || payload?.series || { weekly: [] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Performance"
          description="Track seller metrics and stay within marketplace targets."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {metrics.map((metric) => {
            const percentage = (metric.value / metric.target) * 100;
            const isGood = percentage < 100;
            const isWarning = percentage >= 100 && percentage < 150;
            const isCritical = percentage >= 150;
            
            return (
              <Card key={metric.label} className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className={cn(
                        "h-5 w-5",
                        isGood ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-red-600"
                      )} />
                      {metric.label}
                    </CardTitle>
                    {isGood ? (
                      <Badge className="bg-emerald-500">Good</Badge>
                    ) : isWarning ? (
                      <Badge className="bg-amber-500">Warning</Badge>
                    ) : (
                      <Badge className="bg-red-500">Critical</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target: under {metric.target}%
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-baseline gap-2">
                    <div className={cn(
                      "text-3xl font-bold",
                      isGood ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-red-600"
                    )}>
                      {metric.value}%
                    </div>
                    <span className="text-sm text-muted-foreground">of {metric.target}%</span>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={cn(
                        "h-3",
                        isGood ? "" : isWarning ? "bg-amber-100" : "bg-red-100"
                      )}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% of target</span>
                      {isGood ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          On track
                        </span>
                      ) : (
                        <span className={cn(
                          "flex items-center gap-1",
                          isWarning ? "text-amber-600" : "text-red-600"
                        )}>
                          <TrendingUp className="h-3 w-3" />
                          Above target
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!isLoading && metrics.length === 0 && (
            <Card className="lg:col-span-3 border-2">
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground font-medium">No performance data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Performance metrics will appear here once you start receiving orders
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <Card className="border-2 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Order Volume Trend</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Recent revenue movement across the last 4 weeks.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <SalesChart data={series.weekly || []} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformancePage;
