"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { sellerHubApi } from "@/utils/api";
import { useSearchParams } from "next/navigation";

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
        const payload = response?.data?.data ?? response?.data;
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
          setSummary({
            balance: nextSummary?.balance ?? 0,
            available: nextSummary?.available ?? 0,
            pending: nextSummary?.pending ?? 0,
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

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Payments"
        description="Review balances, payouts, and transaction activity."
      />

      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Balance</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${Number(summary.balance || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available for payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Available funds</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${Number(summary.available || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.nextPayoutInDays !== null
                ? `Next payout in ${summary.nextPayoutInDays} days`
                : "Next payout scheduled"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${Number(summary.pending || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.pendingLabel || "Orders in processing"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell>{payout.method}</TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  <TableCell>${Number(payout.amount || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {!isLoading && payouts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No payouts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>${Number(transaction.amount || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {!isLoading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {transactions.length} of {meta.total || transactions.length} transactions
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * perPage >= (meta.total || 0)}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPage;
