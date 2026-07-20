"use client";

import { useState } from "react";
import { Input, Button, Card, CardHeader, TextField, Label, FieldError } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex flex-col justify-center items-center min-h-[85vh] p-4 bg-[#fafafa] dark:bg-zinc-950">
      <Card className="w-full max-w-[440px] border border-zinc-200/60 dark:border-zinc-850 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/40 dark:shadow-none rounded-2xl p-4">
        
        {/* Header Block matching login layout */}
        <CardHeader className="flex flex-col gap-2 items-center pt-6 pb-4">
          <div className="flex items-center gap-2 text-sm font-black tracking-tight text-zinc-950 dark:text-white">
            <span className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-widest leading-none">
              SD
            </span>
            SKYDGETS
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">
            Create an account
          </h1>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
            Get started with your shopping experience
          </p>
        </CardHeader>

        <div className="flex flex-col gap-4 p-2 pb-4">
          {serverError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold text-center">
              {serverError}
            </div>
          )}
          
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            {/* Full Name Input */}
            <TextField isInvalid={!!errors.name} className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Full Name
              </Label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none transition-all focus:border-zinc-950 dark:focus:border-white text-zinc-900 dark:text-white placeholder:text-zinc-400/70 shadow-none"
                />
              </div>
              {errors.name && <FieldError className="text-[11px] font-medium text-red-500 mt-0.5">{errors.name}</FieldError>}
            </TextField>

            {/* Email Input */}
            <TextField isInvalid={!!errors.email} className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Email
              </Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none transition-all focus:border-zinc-950 dark:focus:border-white text-zinc-900 dark:text-white placeholder:text-zinc-400/70 shadow-none"
                />
              </div>
              {errors.email && <FieldError className="text-[11px] font-medium text-red-500 mt-0.5">{errors.email}</FieldError>}
            </TextField>

            {/* Password Input */}
            <TextField isInvalid={!!errors.password} className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Password
              </Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none transition-all focus:border-zinc-950 dark:focus:border-white text-zinc-900 dark:text-white placeholder:text-zinc-400/70 shadow-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <FieldError className="text-[11px] font-medium text-red-500 mt-0.5">{errors.password}</FieldError>}
            </TextField>

            {/* Premium Stark Action Button */}
            <Button 
              type="submit" 
              isPending={loading}
              className="w-full mt-2 py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-sm rounded-xl transition-all border border-transparent dark:border-white shadow-sm"
            >
              Sign up
            </Button>
          </form>

          {/* Footer Navigation link */}
          <div className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-950 dark:text-white font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </Card>

      {/* Global Bottom Branding Backlink */}
      <Link 
        href="/" 
        className="mt-6 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        ← Back to SKYDGETS
      </Link>
    </div>
  );
}