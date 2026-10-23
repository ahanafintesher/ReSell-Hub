"use client";

import { useSyncExternalStore } from "react";
import { BarChart3, RefreshCw } from "lucide-react";

const emptySubscribe = () => () => {};

export default function ChartCard({
  title,
  subtitle,
  badge,
  action,
  children,
  isEmpty = false,
  emptyIcon: EmptyIcon = BarChart3,
  emptyTitle = "No data recorded",
  emptyDescription = "There are no records available yet to display this visualization.",
  loading = false,
  minHeight = "min-h-[340px]",
  className = "",
}) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition flex flex-col justify-between w-full min-w-0 ${minHeight} ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 truncate">{title}</h3>
            {badge && (
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-200/50">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Chart Body */}
      <div className="relative flex-1 w-full min-w-0 flex items-center justify-center">
        {loading || !isMounted ? (
          <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center space-y-3 bg-gray-50/50 rounded-xl animate-pulse">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <p className="text-xs text-gray-400 font-medium">Preparing interactive visualization...</p>
          </div>
        ) : isEmpty ? (
          <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 bg-gray-50/40 rounded-xl border border-dashed border-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-3">
              <EmptyIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-gray-800">{emptyTitle}</p>
            <p className="mt-1 max-w-xs text-xs text-gray-500 leading-normal">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div className="w-full h-[280px] sm:h-[300px] min-w-0">{children}</div>
        )}
      </div>
    </div>
  );
}
