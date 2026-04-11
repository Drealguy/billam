"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { registerSchema, RegisterFormData } from "@/lib/validations";
import { ArrowRight, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";

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

function PasswordInput({
  placeholder,
  autoComplete,
  onValueChange,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { onValueChange?: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        onChange={e => { rest.onChange?.(e); onValueChange?.(e.target.value); }}
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

function StrengthRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met
        ? <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
        : <Circle size={11} className="text-muted-foreground/40 flex-shrink-0" />}
      <span className={`text-[11px] ${met ? "text-emerald-600" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const rules = [
    { met: password.length >= 8, label: "At least 8 characters" },
    { met: /[A-Z]/.test(password), label: "One uppercase letter" },
    { met: /[0-9]/.test(password), label: "One number" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
        <h1 className="text-2xl font-black">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Free to start — no credit card needed.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.full_name?.message}>
          <Input
            placeholder="Temi Adebayo"
            autoComplete="name"
            {...register("full_name")}
          />
        </Field>

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
            placeholder="Create a strong password"
            autoComplete="new-password"
            onValueChange={setPassword}
            {...register("password")}
          />
          {/* Strength hints */}
          {password.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 px-0.5">
              {rules.map(r => <StrengthRule key={r.label} {...r} />)}
            </div>
          )}
        </Field>

        <Field label="Confirm password" error={errors.confirm_password?.message}>
          <PasswordInput
            placeholder="Repeat your password"
            autoComplete="new-password"
            {...register("confirm_password")}
          />
        </Field>

        {serverError && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
        >
          {isSubmitting ? "Creating account…" : "Create free account"}
          {!isSubmitting && <ArrowRight size={15} />}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:opacity-80">
          Log in
        </Link>
      </p>
    </div>
  );
}
