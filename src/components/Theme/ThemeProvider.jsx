"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  mounted: false,
});

const THEME_STORAGE_KEY = "resellhub_theme";

// External store subscription for theme changes across tabs and same-tab dispatches
function subscribeTheme(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("resellhub_theme_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("resellhub_theme_change", callback);
  };
}

function getThemeSnapshot() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || "system";
  } catch {
    return "system";
  }
}

function getServerThemeSnapshot() {
  return "system";
}

// External store subscription for system color-scheme changes
function subscribeSystemScheme(callback) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getSystemSchemeSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSystemSchemeSnapshot() {
  return "light";
}

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const systemScheme = useSyncExternalStore(
    subscribeSystemScheme,
    getSystemSchemeSnapshot,
    getServerSystemSchemeSnapshot
  );

  const resolvedTheme = theme === "system" ? systemScheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      window.dispatchEvent(new Event("resellhub_theme_change"));
    } catch {
      // LocalStorage write error fallback
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        mounted: true,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
