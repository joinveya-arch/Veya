"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { authService } from "@/services";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import type { Role } from "@/types";

/**
 * Mirrors the backend's registerSchema exactly — same minimums, same phone
 * pattern — so a payload that passes here cannot be rejected server-side for
 * a reason we could have caught in the browser.
 */
const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

type Values = z.infer<typeof schema>;

const ROLES: { value: Extract<Role, "CUSTOMER" | "ARTIST">; label: string; copy: string }[] = [
  { value: "CUSTOMER", label: "I'm booking", copy: "Find and book an artist" },
  { value: "ARTIST", label: "I'm an artist", copy: "List my work and get booked" },
];

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, homeFor } = useAuth();

  const [role, setRole] = useState<"CUSTOMER" | "ARTIST">(
    params.get("role") === "artist" ? "ARTIST" : "CUSTOMER",
  );
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
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role,
      });

      // Register returns the user but no token, so sign in immediately —
      // bouncing a new user to a login screen is a needless speed bump.
      const user = await login(values.email, values.password);
      toast.success("Welcome to VEYA.");
      router.push(
        user.role === "ARTIST" ? "/artist/profile" : homeFor(user.role),
      );
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We couldn't create your account. Please try again.",
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

      <fieldset>
        <legend className="sr-only">I am signing up as</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((option) => {
            const active = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                aria-pressed={active}
                className={cn(
                  "rounded-[var(--radius-input)] border p-4 text-left transition-all duration-200 ease-[var(--ease-out-soft)]",
                  active
                    ? "border-primary bg-primary/[0.03] dark:border-accent dark:bg-accent/[0.06]"
                    : "border-border hover:border-border-strong",
                )}
              >
                <span className="block text-caption font-medium text-foreground">
                  {option.label}
                </span>
                <span className="mt-1 block text-caption text-foreground-muted">
                  {option.copy}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label="Full name" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Ananya Rao"
          icon={<User />}
          invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </Field>

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
        label="Phone"
        htmlFor="phone"
        hint="Optional"
        error={errors.phone?.message}
      >
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98000 00000"
          icon={<Phone />}
          invalid={Boolean(errors.phone)}
          {...register("phone")}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        hint="At least 6 characters"
        error={errors.password?.message}
      >
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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

      <Button type="submit" full size="lg" loading={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-caption text-foreground-muted">
        By continuing you agree to VEYA&apos;s Terms and Privacy Policy.
      </p>
    </form>
  );
}
