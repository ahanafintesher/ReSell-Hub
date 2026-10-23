"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@heroui/react";

export default function AnalyticsPageHeader({
  badgeIcon: BadgeIcon = Sparkles,
  badgeText = "Live Analytics",
  badgeVariant = "green", // green | blue
  title,
  subtitle,
  onRefresh,
  refreshing = false,
  lastUpdated,
  actions,
}) {
  const badgeClasses =
    badgeVariant === "blue"
      ? "bg-blue-100/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40"
      : "bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
      <div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2 border ${badgeClasses}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
          {badgeText}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-3xl">
          {title}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <span>{subtitle}</span>
          {lastUpdated && (
            <>
              <span className="text-gray-300 dark:text-slate-600">•</span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                Updated {lastUpdated}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            color="default"
            variant="flat"
            size="sm"
            startContent={
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""}`}
              />
            }
            onPress={onRefresh}
            isDisabled={refreshing}
            className="font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
          >
            {refreshing ? "Refreshing..." : "Refresh Metrics"}
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
}
