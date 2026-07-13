import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-h2">Reset your password</h1>
      <p className="mt-3 text-body text-foreground-secondary">
        Enter the email you signed up with and we&apos;ll send you a link to
        choose a new password.
      </p>

      <div className="mt-10">
        <ForgotPasswordForm />
      </div>

      <p className="mt-10 text-center text-caption text-foreground-secondary">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
