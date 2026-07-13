"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarDays, LayoutGrid, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import type { Role } from "@/types";

const MENU_BY_ROLE: Record<
  Role,
  { href: string; label: string; icon: typeof LayoutGrid }[]
> = {
  CUSTOMER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/bookings", label: "My bookings", icon: CalendarDays },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
  ],
  ARTIST: [
    { href: "/artist", label: "Dashboard", icon: LayoutGrid },
    { href: "/artist/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/artist/profile", label: "Profile", icon: UserIcon },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutGrid },
    { href: "/admin/artists", label: "Artists", icon: UserIcon },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  ],
};

const itemClass =
  "flex cursor-pointer select-none items-center gap-3 rounded-[10px] px-3 py-2.5 text-caption text-foreground-secondary outline-none transition-colors data-[highlighted]:bg-surface-sunken data-[highlighted]:text-foreground [&_svg]:size-4";

export function AccountMenu({ onDark = false }: { onDark?: boolean }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = MENU_BY_ROLE[user.role];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-full p-1 pr-1 transition-colors",
            onDark ? "hover:bg-white/10" : "hover:bg-surface-sunken",
          )}
          aria-label="Account menu"
        >
          <Avatar name={user.name} size="sm" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className={cn(
            "z-50 w-64 rounded-[var(--radius-card)] border border-border bg-surface p-1.5 shadow-[var(--shadow-lifted)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          )}
        >
          <div className="px-3 py-3">
            <p className="truncate font-display text-body font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-caption text-foreground-muted">
              {user.email}
            </p>
          </div>

          <DropdownMenu.Separator className="mx-3 my-1 h-px bg-border" />

          {items.map(({ href, label, icon: Icon }) => (
            <DropdownMenu.Item key={href} asChild className={itemClass}>
              <Link href={href}>
                <Icon aria-hidden />
                {label}
              </Link>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="mx-3 my-1 h-px bg-border" />

          <DropdownMenu.Item
            className={cn(itemClass, "data-[highlighted]:text-error")}
            onSelect={logout}
          >
            <LogOut aria-hidden />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
