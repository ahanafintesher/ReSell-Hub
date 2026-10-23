"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "motion/react";

export default function ThemeToggle({
  variant = "compact", // "compact" | "segmented" | "dropdown"
  className = "",
}) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();

  if (!mounted) {
    // Render skeleton/placeholder to prevent hydration mismatch
    return (
      <div
        className={`inline-flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  // Segmented control (Used in Settings page or large toolbars)
  if (variant === "segmented") {
    const options = [
      { id: "light", label: "Light", icon: Sun },
      { id: "dark", label: "Dark", icon: Moon },
      { id: "system", label: "System", icon: Monitor },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Theme selector"
        className={`inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                isSelected
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeThemePill"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-700/80"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact toggle for Navbars
  const toggleNext = () => {
    // Cycle between light and dark when clicked directly
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleNext}
      className={`relative inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode (current: ${theme})`}
      title={`Current: ${theme.toUpperCase()} mode. Click to toggle.`}
    >
      <motion.div
        key={resolvedTheme}
        initial={{ rotate: -45, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 45, scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-emerald-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </motion.div>
    </button>
  );
}
