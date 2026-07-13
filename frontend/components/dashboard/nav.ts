import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Images,
  LayoutGrid,
  MessageSquare,
  Tag,
  User,
  Users,
} from "lucide-react";
import type { NavItem } from "./dashboard-shell";

/** The first entry of each list is the section root — DashboardShell uses it
 *  to decide when a link is "active" by prefix rather than exact match. */

export const CUSTOMER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export const ARTIST_NAV: NavItem[] = [
  { href: "/artist", label: "Overview", icon: LayoutGrid },
  { href: "/artist/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/artist/services", label: "Services", icon: Tag },
  { href: "/artist/portfolio", label: "Portfolio", icon: Images },
  { href: "/artist/availability", label: "Availability", icon: CalendarCheck },
  { href: "/artist/profile", label: "Profile", icon: User },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/artists", label: "Artists", icon: BadgeCheck },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
];
