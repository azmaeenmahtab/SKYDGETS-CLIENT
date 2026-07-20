"use client";

import { useState } from "react";
// 1. Updated HeroUI imports to include form structural primitives
import { Input, Button, Card, CardHeader, TextField, Label, FieldError } from "@heroui/react";
import { signIn } from "@/lib/auth-client";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleLogin = async (e?: React.FormEvent, isDemo = false) => {
    e?.preventDefault();
    setErrors({});
    setServerError("");

    const dataToValidate = isDemo
      ? { email: "demo@skydgets.com", password: "password123" }
      : { email, password };

    const result = loginSchema.safeParse(dataToValidate);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn.email({
      email: result.data.email,
      password: result.data.password,
    });
    
    if (error) {
      setServerError(error.message || "Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/");
  };

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center py-6">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-default-500">Sign in to your account to continue</p>
        </CardHeader>
        <div className="flex flex-col gap-4 p-4 pb-8">
          {serverError && (
            <div className="p-3 bg-danger-50 text-danger-500 rounded-lg text-sm text-center">
              {serverError}
            </div>
          )}
          
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Email Field Group */}
            <TextField isInvalid={!!errors.email} className="flex flex-col gap-1">
              <Label>Email</Label>
              <Input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <FieldError className="text-xs text-danger">{errors.email}</FieldError>}
            </TextField>

            {/* Password Field Group */}
            <TextField isInvalid={!!errors.password} className="flex flex-col gap-1">
              <Label>Password</Label>
              <Input
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <FieldError className="text-xs text-danger">{errors.password}</FieldError>}
            </TextField>

            {/* Submit Button (Changed isLoading to isPending) */}
            <Button type="submit" isPending={loading && !serverError}>
              Sign In
            </Button>
          </form>

          {/* Demo Login Button */}
          <Button 
            onPress={() => handleLogin(undefined, true)}
            isPending={loading && !serverError}
          >
            Demo Login
          </Button>

          <div className="relative flex items-center my-2">
            <div className="flex-1 border-b" />
            <span className="text-tiny text-default-400 mx-2 uppercase font-medium">Or</span>
            <div className="flex-1 border-b" />
          </div>

          {/* Google Sign In Button */}
          <Button onPress={handleGoogleSignIn}>
            Sign in with Google
          </Button>

          <div className="text-center text-sm text-default-500 mt-2">
            Don't have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}