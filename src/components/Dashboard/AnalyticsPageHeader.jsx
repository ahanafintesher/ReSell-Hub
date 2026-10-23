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
      ? "bg-blue-100/80 text-blue-700 border-blue-200"
      : "bg-green-100/80 text-green-700 border-green-200";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-100">
      <div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2 border ${badgeClasses}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
          {badgeText}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>{subtitle}</span>
          {lastUpdated && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-400">
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
                className={`h-4 w-4 ${refreshing ? "animate-spin text-green-600" : ""}`}
              />
            }
            onPress={onRefresh}
            isDisabled={refreshing}
            className="font-medium bg-white border border-gray-200 hover:bg-gray-50 shadow-xs"
          >
            {refreshing ? "Refreshing..." : "Refresh Metrics"}
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
}
