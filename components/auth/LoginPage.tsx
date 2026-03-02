"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/lib/auth-store";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, token } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      router.replace("/");
    }
  }, [token, router]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const { token: authToken, manager } = response.data;
      setAuth(authToken, manager);
      toast.success("Login successful! Welcome back.");
      router.push("/");
    } catch (error: any) {
      const message =
        error?.message || error?.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-dvh flex bg-white">
      {/* Left Section - Image */}
      <div className="hidden lg:block w-1/2 h-full">
        <img
          src="/admin-login.png"
          alt="Login illustration"
          className="h-full w-full object-cover object-top"
        />
      </div>

      {/* Right Section - Login Form */}
      <div className="flex flex-1 items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-[440px] p-6 sm:p-8">
          <CardHeader className="text-center px-0 pt-0 pb-8">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Admin Login
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-2">
              Welcome back! Please enter your details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  className={`h-11 bg-white border-gray-200 focus:ring-1 focus:ring-red-500/20 focus:border-red-500 ${errors.email ? "border-red-500" : ""
                    }`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className={`h-11 pr-10 bg-white border-gray-200 focus:ring-1 focus:ring-red-500/20 focus:border-red-500 ${errors.password ? "border-red-500" : ""
                      }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2 sm:gap-0">
                <label className="flex items-center cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-red-600 font-medium hover:underline hover:text-red-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-10">
            © {new Date().getFullYear()} Caremall Delivery Hub. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
