"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const StatCard = ({ 
  label, 
  value, 
  helper, 
  icon: Icon, 
  color = "blue",
  trend,
  onClick,
  className 
}) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  };
  
  const CardComponent = onClick ? 'button' : 'div';
  
  return (
    <Card 
      as={CardComponent}
      className={cn(
        "border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg group relative overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm",
              colorClasses[color]
            )}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</div>
        {helper && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{helper}</p>
            {trend && (
              <span className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
              )}>
                {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
