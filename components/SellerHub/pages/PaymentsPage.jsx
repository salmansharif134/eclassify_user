"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { sellerHubApi } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { Wallet, RefreshCw, DollarSign, Clock, CheckCircle2, Download, Search } from "lucide-react";
import StatCard from "@/components/SellerHub/components/StatCard";
import { StatCardSkeleton, TableSkeleton, CardSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PaymentsPage = () => {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState({
    balance: 0,
    available: 0,
    pending: 0,
    nextPayoutInDays: null,
    pendingLabel: "",
  });
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getPayments({
          page,
          perPage,
          query: query || undefined,
        });
        console.log("=== PAYMENTS API DEBUG ===");
        console.log("1. Full Response:", response);
        console.log("2. Response Data:", response?.data);
        console.log("3. Response Data Data:", response?.data?.data);
        
        const payload = response?.data?.data ?? response?.data;
        console.log("4. Final Payload:", payload);
        console.log("5. Balance Summary from payload:", payload?.balanceSummary);
        console.log("6. Summary from payload:", payload?.summary);
        console.log("7. All payload keys:", Object.keys(payload || {}));
        
        const list = Array.isArray(payload?.transactions)
          ? payload.transactions
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const nextMeta = payload?.meta || {
          page,
          perPage,
          total: Array.isArray(list) ? list.length : 0,
        };
        if (isMounted) {
          const nextSummary = payload?.balanceSummary || payload?.summary || summary;
          console.log("Setting Summary:", nextSummary);
          setSummary({
            balance: Number(nextSummary?.balance ?? 0),
            available: Number(nextSummary?.available ?? 0),
            pending: Number(nextSummary?.pending ?? 0),
            nextPayoutInDays:
              nextSummary?.nextPayoutInDays ??
              nextSummary?.next_payout_in_days ??
              null,
            pendingLabel:
              nextSummary?.pendingLabel ??
              nextSummary?.pending_label ??
              "Orders in processing",
          });
          setPayouts(payload?.payouts || []);
          setTransactions(list);
          setMeta(nextMeta);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load payments.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchPayments();
    return () => {
      isMounted = false;
    };
  }, [page, perPage, query]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Payments"
          description="Review balances, payouts, and transaction activity."
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
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Balance"
            value={`$${Number(summary.balance || 0).toLocaleString()}`}
            helper="Available for payout"
            icon={Wallet}
            color="blue"
          />
          <StatCard
            label="Available Funds"
            value={`$${Number(summary.available || 0).toLocaleString()}`}
            helper={summary.nextPayoutInDays !== null
              ? `Next payout in ${summary.nextPayoutInDays} days`
              : "Next payout scheduled"}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            label="Pending"
            value={`$${Number(summary.pending || 0).toLocaleString()}`}
            helper={summary.pendingLabel || "Orders in processing"}
            icon={Clock}
            color="amber"
          />
        </div>
      )}

      {/* Search */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Search Transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction ID or type..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Payout History</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {payouts.length} {payouts.length === 1 ? 'payout' : 'payouts'}
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Payout ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Method</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout, index) => (
                    <TableRow 
                      key={payout.id}
                      className="hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium font-mono text-sm">{payout.id}</TableCell>
                      <TableCell>{payout.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payout.method || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${Number(payout.amount || 0).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && payouts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Wallet className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No payouts found</p>
                          <p className="text-sm text-muted-foreground">
                            Payout history will appear here once payments are processed
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Transactions</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Transaction ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow 
                      key={transaction.id}
                      className="hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium font-mono text-sm">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transaction.type || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-semibold",
                          (transaction.type || "").toLowerCase().includes("refund") 
                            ? "text-red-600 dark:text-red-400" 
                            : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          ${(transaction.type || "").toLowerCase().includes("refund") ? "-" : ""}
                          {Number(transaction.amount || 0).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No transactions found</p>
                          <p className="text-sm text-muted-foreground">
                            {query ? "Try adjusting your search" : "Transaction history will appear here"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {!isLoading && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{transactions.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{meta.total || transactions.length}</span> transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground px-2">
                    Page {page} of {Math.ceil((meta.total || 0) / perPage) || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * perPage >= (meta.total || 0) || isLoading}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentsPage;
