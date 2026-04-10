"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
      {...props}
    />
  );
}

function PasswordInput({ placeholder, autoComplete, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full space-y-7">
      <div className="space-y-1">
        <h1 className="text-2xl font-black">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your Bill Am account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email address" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="temi@studio.ng"
            autoComplete="email"
            {...register("email")}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <PasswordInput
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          <div className="text-right mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </Field>

        {(serverError || callbackError) && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
            {serverError ?? callbackError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
          {!isSubmitting && <ArrowRight size={15} />}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:opacity-80">
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
