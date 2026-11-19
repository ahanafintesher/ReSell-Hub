"use client";

import { Card } from "@heroui/react";
import React, { useState, Suspense } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { getGoogleAuthConfig } from "@/lib/actions/auth-config";

/**
 * Validates and sanitizes internal redirects to prevent open-redirect vulnerabilities.
 * Disallows external URLs, protocol-relative (//example.com), and backslash tricks.
 */
function getSafeRedirectUrl(target) {
  if (!target || typeof target !== "string") return "/";
  const trimmed = target.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return "/";
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return "/";
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return "/";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";
  const safeRedirect = getSafeRedirectUrl(rawRedirect);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);

  React.useEffect(() => {
    let active = true;
    getGoogleAuthConfig()
      .then((cfg) => {
        if (active) setGoogleAuthEnabled(cfg.isConfigured);
      })
      .catch(() => {
        if (active) setGoogleAuthEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    const { data, error } = await authClient.signIn.email({
      email: user.email,
      password: user.password,
      callbackURL: safeRedirect,
    });

    if (error) {
      setErrorMessage(error.message || "Login failed");
      toast.error(error.message || "Login failed");
      setLoading(false);
      return;
    }

    if (data) {
      toast.success("Login successful");
      router.push(safeRedirect);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!googleAuthEnabled) {
      toast.error("Google Sign-In is currently unavailable on this deployment.");
      return;
    }
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: safeRedirect,
      });
      if (res?.error) {
        toast.error(res.error.message || "Failed to initiate Google sign-in.");
      }
    } catch (err) {
      toast.error(err.message || "Google sign-in is currently unavailable.");
    }
  };

  return (
    <div className="w-full px-4 py-6 sm:max-w-7xl sm:mx-auto flex justify-center">
      <Card className="p-4 sm:p-6 w-full max-w-md">
        <Form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
          <h2 className="text-2xl font-bold text-center">Login</h2>

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          <TextField
            isRequired
            name="email"
            type="email"
            validate={(value) => {
              if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return "Please enter a valid email address";
              }
              return null;
            }}
          >
            <Label>Email</Label>
            <Input placeholder="john@example.com" />
            <FieldError />
          </TextField>

          <TextField
            isRequired
            minLength={6}
            name="password"
            type={showPassword ? "text" : "password"}
          >
            <Label>Password</Label>

            <div className="relative">
              <Input className="w-full" placeholder="Enter your password" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <Description>Enter your account password</Description>
            <FieldError />
          </TextField>

          <div className="flex justify-center gap-2 w-full">
            <Button
              isLoading={loading}
              className="w-full rounded-none bg-green-600 text-white"
              type="submit"
            >
              Login
            </Button>
          </div>

          <div className="flex items-center gap-4 my-1">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={!googleAuthEnabled}
            className="w-full rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGoogleLogin}
            title={
              !googleAuthEnabled
                ? "Google authentication is not configured on this server"
                : undefined
            }
          >
            <FcGoogle size={20} />
            {googleAuthEnabled ? "Continue with Google" : "Google Sign-In (Unavailable)"}
          </Button>

          {!googleAuthEnabled && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              Google authentication is not configured on this server.
            </p>
          )}

          <p className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link
              href={
                safeRedirect && safeRedirect !== "/"
                  ? `/auth/register?redirect=${encodeURIComponent(safeRedirect)}`
                  : "/auth/register"
              }
              className="text-blue-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </Form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full px-4 py-6 sm:max-w-7xl sm:mx-auto flex justify-center">
          <Card className="p-4 sm:p-6 w-full max-w-md animate-pulse">
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-6" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}