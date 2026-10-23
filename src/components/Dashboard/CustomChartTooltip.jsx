"use client";

import { formatBDT } from "@/lib/analyticsUtils";

export default function CustomChartTooltip({
  active,
  payload,
  label,
  isCurrency = false,
  valuePrefix = "",
  valueSuffix = "",
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm text-xs">
      {label && (
        <p className="font-semibold text-gray-900 border-b border-gray-100 pb-1.5 mb-2">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const formattedVal = isCurrency
            ? formatBDT(item.value)
            : `${valuePrefix}${Number(item.value).toLocaleString()}${valueSuffix}`;

          return (
            <div
              key={`tooltip-item-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color || item.fill || "#10b981" }}
                />
                <span className="text-gray-600 font-medium capitalize">
                  {item.name || item.dataKey}:
                </span>
              </div>
              <span className="font-bold text-gray-900">{formattedVal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
