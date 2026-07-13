"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/states";
import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The chrome for every signed-in surface. Notion-like, not admin-like: a
 * quiet left rail of text links, a typographic page header, and nothing
 * else. No stat-card wall, no coloured sidebar, no breadcrumb bar.
 */
export function DashboardShell({
  role,
  nav,
  title,
  description,
  action,
  children,
}: {
  /** Only this role may view the section; anyone else is redirected home. */
  role: Role;
  nav: NavItem[];
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, isLoading, homeFor } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (user.role !== role) {
      // Signed in, wrong section — send them to their own.
      router.replace(homeFor(user.role));
    }
  }, [user, isLoading, role, router, pathname, homeFor]);

  // Render the shell, not a spinner, while the session rehydrates — a full
  // page flash on every navigation feels broken even when it isn't.
  const ready = !isLoading && user?.role === role;

  return (
    <>
      <Navbar />
      <main id="main" className="min-h-screen pt-20">
        <Container size="wide" className="py-14 md:py-16">
          <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[13rem_1fr]">
            <aside>
              <nav aria-label="Dashboard">
                <ul className="scrollbar-none -mx-2 flex gap-1 overflow-x-auto lg:sticky lg:top-28 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible">
                  {nav.map(({ href, label, icon: Icon }) => {
                    const active =
                      pathname === href ||
                      (href !== nav[0].href && pathname.startsWith(href));
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 whitespace-nowrap rounded-[var(--radius-input)] px-3 py-2.5 text-caption font-medium",
                            "transition-colors duration-200 ease-[var(--ease-out-soft)]",
                            active
                              ? "bg-surface-sunken text-foreground"
                              : "text-foreground-secondary hover:text-foreground",
                          )}
                        >
                          <Icon className="size-4 shrink-0" aria-hidden />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0">
              <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-3">
                  <h1 className="text-h2">{title}</h1>
                  {description && (
                    <p className="max-w-[42rem] text-body text-foreground-secondary">
                      {description}
                    </p>
                  )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
              </header>

              <div className="mt-12">
                {ready ? children : <ShellSkeleton />}
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}

function ShellSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-[var(--radius-card)]" />
      ))}
    </div>
  );
}
