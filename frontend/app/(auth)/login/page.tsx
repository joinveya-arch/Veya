import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Skeleton } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your VEYA account.",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-h2">Welcome back</h1>
      <p className="mt-3 text-body text-foreground-secondary">
        Sign in to manage your bookings and saved artists.
      </p>

      <div className="mt-10">
        <Suspense fallback={<Skeleton className="h-[19rem] w-full" />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-10 text-center text-caption text-foreground-secondary">
        New to VEYA?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
