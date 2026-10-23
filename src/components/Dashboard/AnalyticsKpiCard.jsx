"use client";

export default function AnalyticsKpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  colorScheme = "green", // green | blue | purple | amber | red
  loading = false,
}) {
  const schemeStyles = {
    green: {
      bg: "bg-emerald-50 text-emerald-600",
      accent: "text-emerald-700",
    },
    blue: {
      bg: "bg-blue-50 text-blue-600",
      accent: "text-blue-700",
    },
    purple: {
      bg: "bg-purple-50 text-purple-600",
      accent: "text-purple-700",
    },
    amber: {
      bg: "bg-amber-50 text-amber-600",
      accent: "text-amber-700",
    },
    red: {
      bg: "bg-rose-50 text-rose-600",
      accent: "text-rose-700",
    },
  };

  const style = schemeStyles[colorScheme] || schemeStyles.green;

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
        </div>
        <div className="mt-3 h-8 w-32 bg-gray-200 rounded" />
        <div className="mt-2 h-3 w-20 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg} shrink-0`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <p className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
        {value}
      </p>

      {subtext && (
        <p className="mt-1 text-xs text-gray-500 leading-normal">{subtext}</p>
      )}
    </div>
  );
}
