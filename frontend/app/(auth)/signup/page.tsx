import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";
import { Skeleton } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join VEYA to book verified makeup artists and hairstylists.",
};

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-h2">Create your account</h1>
      <p className="mt-3 text-body text-foreground-secondary">
        It takes a minute, and it&apos;s free.
      </p>

      <div className="mt-10">
        <Suspense fallback={<Skeleton className="h-[36rem] w-full" />}>
          <SignupForm />
        </Suspense>
      </div>

      <p className="mt-10 text-center text-caption text-foreground-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
