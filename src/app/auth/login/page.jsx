"use client";

import { Card } from "@heroui/react";
import React, { useState } from "react";
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
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries());

    const { data, error } = await authClient.signIn.email({
      email: user.email,
      password: user.password,
      callbackURL: "/",
    });

    if (error) {
      setErrorMessage(error.message || "Login failed");
      toast.error(error.message || "Login failed");
      setLoading(false);
      return;
    }
// base url changed
    if (data) {
      toast.success("Login successful");
      router.push("/");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
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
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
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
            className="w-full rounded-none"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={20} />
            Continue with Google
          </Button>

          <p className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;