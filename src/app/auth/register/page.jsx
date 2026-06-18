"use client";
import { Card } from "@heroui/react";
import React, { useState } from "react";
// import toast from "react-hot-toast";
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
// import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
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

    const { data, error } = await authClient.signUp.email({
      email: user.email,
      password: user.password,
      name: user.name,
      image: user.image,
    });

    if (error) {
      setErrorMessage(error.message || "Registration failed");
      toast.error(error.message || "Registration failed");
      setLoading(false);
      return;
    }

    if (data) {
      toast.success("Registration successful");
      router.push("/");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
   
    <div className="w-full px-4 py-6 sm:max-w-7xl sm:mx-auto flex justify-center">
     
      <Card className="p-4 sm:p-6 w-full max-w-md">
       
        <Form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
          <h2 className="text-2xl font-bold text-center">Register</h2>

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          <TextField isRequired name="name" type="text">
            <Label>Name</Label>
            <Input placeholder="Enter Your Name" />
            <FieldError />
          </TextField>

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

          <TextField name="image" type="url">
            <Label>Photo URL</Label>
            <Input placeholder="Enter Photo URL" />
            <FieldError />
          </TextField>

          <TextField
            isRequired
            minLength={6}
            name="password"
            type={showPassword ? "text" : "password"}
            validate={(value) => {
              if (value.length < 6) return "Password must be at least 6 characters";
              if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
              if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
              return null;
            }}
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

            <Description>
              Must be at least 6 characters with uppercase & lowercase letter
            </Description>
            <FieldError />
          </TextField>

          <div className="flex justify-center gap-2 w-full">
            <Button
              isLoading={loading}
              className="w-full rounded-none bg-green-600 text-white"
              type="submit"
            >
              Register
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
            <FcGoogle />
            Continue with Google
          </Button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;