"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

/** Mirrors the backend's loginSchema. */
const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, homeFor } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setFormError(null);
    try {
      const user = await login(values.email, values.password);
      // `next` preserves a booking the user was mid-way through.
      const next = params.get("next");
      router.push(next || homeFor(user.role));
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We couldn't sign you in. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-[var(--radius-input)] bg-error-soft px-4 py-3 text-caption text-error"
        >
          {formError}
        </p>
      )}

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail />}
          invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
      >
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock />}
            invalid={Boolean(errors.password)}
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-foreground-muted transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-[1.125rem]" aria-hidden />
            ) : (
              <Eye className="size-[1.125rem]" aria-hidden />
            )}
          </button>
        </div>
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-caption text-foreground-secondary underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-accent"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" full size="lg" loading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
