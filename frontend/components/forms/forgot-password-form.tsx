"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MailCheck } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setFormError(null);
    try {
      // NOTE: the backend does not expose POST /auth/forgot-password yet.
      // The UI is complete and correct; adding that route is all that's left
      // to make this flow work end to end.
      await api.post("/auth/forgot-password", { email: values.email });
      setSentTo(values.email);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We couldn't send that email. Please try again.",
      );
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center">
        <div
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success"
          aria-hidden
        >
          <MailCheck className="size-5" />
        </div>
        <h2 className="mt-6 font-display text-h4 font-medium">
          Check your inbox
        </h2>
        <p className="mt-3 text-caption text-foreground-secondary">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{sentTo}</span>, we&apos;ve
          sent a link to reset your password. It expires in an hour.
        </p>
      </div>
    );
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

      <Button type="submit" full size="lg" loading={isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}
