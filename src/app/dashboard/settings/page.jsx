"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Monitor,
  User,
  ShieldCheck,
  Bell,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Smartphone,
  Eye,
  Info,
  Loader2,
  Sliders,
} from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { motion } from "motion/react";

import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/components/Theme/ThemeProvider";
import ThemeToggle from "@/components/Theme/ThemeToggle";

const DEFAULT_UI_PREFS = {
  toastAlerts: true,
  compactTables: false,
  autoRefreshCharts: true,
};

function subscribeUiPrefs(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("resellhub_uiprefs_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("resellhub_uiprefs_change", callback);
  };
}

function getUiPrefsSnapshot() {
  try {
    return localStorage.getItem("resellhub_ui_prefs") || "";
  } catch {
    return "";
  }
}

function getServerUiPrefsSnapshot() {
  return "";
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = session?.user;

  // Account editing state synced with user session
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [prevUser, setPrevUser] = useState(user);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync state if user loads/updates after initial render
  if (user !== prevUser) {
    setPrevUser(user);
    setDisplayName(user?.name || "");
    setLocation(user?.location || "");
  }

  // Client UI Preferences synced via useSyncExternalStore
  const rawUiPrefs = useSyncExternalStore(
    subscribeUiPrefs,
    getUiPrefsSnapshot,
    getServerUiPrefsSnapshot
  );

  const uiPrefs = useMemo(() => {
    if (!rawUiPrefs) return DEFAULT_UI_PREFS;
    try {
      return { ...DEFAULT_UI_PREFS, ...JSON.parse(rawUiPrefs) };
    } catch {
      return DEFAULT_UI_PREFS;
    }
  }, [rawUiPrefs]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    try {
      setIsSavingProfile(true);
      const updateData = { name: displayName.trim() };
      if (location.trim()) {
        updateData.location = location.trim();
      }

      const { error } = await authClient.updateUser(updateData);
      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      setProfileSuccess(true);
      toast.success("Profile preferences saved successfully");
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || "Failed to save profile changes");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTogglePref = (key) => {
    const updated = { ...uiPrefs, [key]: !uiPrefs[key] };
    try {
      localStorage.setItem("resellhub_ui_prefs", JSON.stringify(updated));
      window.dispatchEvent(new Event("resellhub_uiprefs_change"));
      toast.success("Preference updated");
    } catch {
      // Ignore
    }
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login");
          router.refresh();
        },
      },
    });
  };

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-slate-500">Loading settings...</p>
      </div>
    );
  }

  const role = user?.role || "buyer";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
          <Sliders className="h-3.5 w-3.5" />
          Platform Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Account & Interface Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Customize your marketplace appearance, manage your display profile, and configure browser preferences.
        </p>
      </div>

      {/* SECTION 1: APPEARANCE & THEME */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Appearance & Theme
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Select your color preference across all public pages, modals, and role dashboards.
            </p>
          </div>
          <ThemeToggle variant="segmented" />
        </div>

        {/* Visual Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`group relative rounded-2xl p-4 text-left border-2 transition-all cursor-pointer ${
              theme === "light"
                ? "border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Sun className="h-4 w-4" />
              </span>
              {theme === "light" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Light Theme</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Crisp white and soft neutral surfaces with vibrant emerald accents.
            </p>
          </button>

          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`group relative rounded-2xl p-4 text-left border-2 transition-all cursor-pointer ${
              theme === "dark"
                ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Moon className="h-4 w-4" />
              </span>
              {theme === "dark" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Dark Theme</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Deep slate & charcoal backgrounds optimized for low-light environments.
            </p>
          </button>

          {/* System Mode Card */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`group relative rounded-2xl p-4 text-left border-2 transition-all cursor-pointer ${
              theme === "system"
                ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                <Monitor className="h-4 w-4" />
              </span>
              {theme === "system" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              )}
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Sync with System</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automatically match your operating system preference ({resolvedTheme} active).
            </p>
          </button>
        </div>
      </motion.section>

      {/* SECTION 2: ACCOUNT & PROFILE INFORMATION */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Account Information
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Verified credentials from Better Auth authentication store.
            </p>
          </div>

          <Link
            href="/dashboard/buyer/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Open Full Profile Manager
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Email (Immutable) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
                Fixed credential associated with authentication provider
              </span>
            </div>

            {/* Assigned Role */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned Role
              </label>
              <div className="flex items-center h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-sm capitalize text-slate-700 dark:text-slate-300 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                {role}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {profileSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
            <Button
              type="submit"
              color="primary"
              size="sm"
              isDisabled={isSavingProfile}
              startContent={
                isSavingProfile ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )
              }
              className="bg-emerald-600 text-white font-semibold shadow-xs hover:bg-emerald-700"
            >
              {isSavingProfile ? "Saving..." : "Save Profile Changes"}
            </Button>
          </div>
        </form>
      </motion.section>

      {/* SECTION 3: BROWSER & CLIENT PREFERENCES */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 shadow-xs space-y-4"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Browser & UI Preferences
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Client-side preferences stored locally on this device. (Server-side webhooks & email alerts are managed by platform administrators).
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Toast notifications */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Action Feedback Toasts
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Display top-right notification toasts when actions succeed or encounter errors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePref("toastAlerts")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                uiPrefs.toastAlerts ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  uiPrefs.toastAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Auto Refresh Charts */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Responsive Chart Smoothing
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Render restrained transitions and animated gradients on Recharts containers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePref("autoRefreshCharts")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                uiPrefs.autoRefreshCharts ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  uiPrefs.autoRefreshCharts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Compact Tables */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Compact Data Tables
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optimize density for smaller desktop displays and detailed inventory audits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePref("compactTables")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                uiPrefs.compactTables ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  uiPrefs.compactTables ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.section>

      {/* SECTION 4: SECURITY & ACTIVE SESSION */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 shadow-xs space-y-4"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Security & Session
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Authentication state verified through Better Auth session cookies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5">
            <p className="text-slate-400 font-medium">Session Status</p>
            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active & Verified
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5">
            <p className="text-slate-400 font-medium">Account Role Permission</p>
            <p className="mt-1 font-bold text-slate-800 dark:text-slate-200 capitalize">
              {role} Level Access
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-400 leading-normal">
            To switch accounts or terminate this active session, sign out below.
          </p>
          <Button
            color="danger"
            variant="flat"
            size="sm"
            startContent={<LogOut className="h-3.5 w-3.5" />}
            onPress={handleLogout}
            className="font-semibold"
          >
            Sign Out of Account
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
