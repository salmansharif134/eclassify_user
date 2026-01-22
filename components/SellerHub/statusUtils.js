import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase();
  const classes = {
    pending: "bg-amber-500 text-white",
    shipped: "bg-blue-600 text-white",
    delivered: "bg-emerald-600 text-white",
    returned: "bg-rose-600 text-white",
    paid: "bg-emerald-600 text-white",
    refunded: "bg-rose-600 text-white",
    active: "bg-emerald-600 text-white",
    draft: "bg-slate-500 text-white",
    ended: "bg-slate-700 text-white",
    low: "bg-amber-500 text-white",
    out: "bg-rose-600 text-white",
    healthy: "bg-emerald-600 text-white",
    processing: "bg-blue-600 text-white",
    completed: "bg-emerald-600 text-white",
    approved: "bg-emerald-600 text-white",
    rejected: "bg-rose-600 text-white",
    paused: "bg-slate-600 text-white",
  };

  const className = classes[normalized] || "bg-slate-600 text-white";
  const label = status ? String(status) : "Unknown";

  return <Badge className={className}>{label}</Badge>;
};
