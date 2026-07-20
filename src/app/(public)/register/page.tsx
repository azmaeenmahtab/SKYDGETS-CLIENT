"use client";

import { useState } from "react";
// 1. Imported the necessary composition components from HeroUI
import { Input, Button, Card, CardHeader, TextField, Label, FieldError } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      email: result.data.email,
      password: result.data.password,
      name: result.data.name,
    });
    
    if (error) {
      setServerError(error.message || "Failed to create account");
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center py-6">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-sm text-default-500">Join SKYDGETS today</p>
        </CardHeader>
        <div className="flex flex-col gap-4 p-4 pb-8">
          {serverError && (
            <div className="p-3 bg-danger-50 text-danger-500 rounded-lg text-sm text-center">
              {serverError}
            </div>
          )}
          
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            {/* Name Input */}
            <TextField isInvalid={!!errors.name} className="flex flex-col gap-1">
              <Label>Name</Label>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <FieldError className="text-xs text-danger">{errors.name}</FieldError>}
            </TextField>

            {/* Email Input */}
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

            {/* Password Input */}
            <TextField isInvalid={!!errors.password} className="flex flex-col gap-1">
              <Label>Password</Label>
              <Input
                placeholder="Create a password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <FieldError className="text-xs text-danger">{errors.password}</FieldError>}
            </TextField>

            {/* Submit Button (HeroUI v3 uses isPending instead of isLoading) */}
            <Button type="submit" isPending={loading}>
              Register
            </Button>
          </form>

          <div className="text-center text-sm text-default-500 mt-2">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}