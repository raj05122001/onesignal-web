// components/Sidebar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  Users,
  ListChecks,
  LayoutDashboard,
  Send,
  LogOut,
  Settings,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/utils/classNames";

/* shadcn/ui */
import { Button } from "@/components/ui/button";

/* ───────────────────────────────────────────────
   ⧉  Enhanced Sidebar
   • Modern design with animations
   • Better visual hierarchy
   • Improved UX with micro-interactions
─────────────────────────────────────────────── */
export default function Sidebar({ role = "SENDER" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* Nav map per-role with badges/counters */
  const NAV = {
    ADMIN: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        badge: null,
      },
      {
        href: "/admin/subscribers",
        label: "Subscribers",
        icon: <Users className="h-5 w-5" />,
        badge: "1.2k",
      },
      {
        href: "/admin/groups",
        label: "Groups",
        icon: <ListChecks className="h-5 w-5" />,
        badge: "24",
      },
      {
        href: "/sender/dashboard",
        label: "Notifications",
        icon: <Bell className="h-5 w-5" />,
        badge: "5",
      },
    ],
    SENDER: [
      {
        href: "/sender/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        badge: null,
      },
      {
        href: "/sender/new",
        label: "Send Notification",
        icon: <Send className="h-5 w-5" />,
        badge: null,
      },
      {
        href: "/sender/history",
        label: "History",
        icon: <Bell className="h-5 w-5" />,
        badge: "12",
      },
    ],
  };

  const navItems = NAV[role] || [];

  /* Enhanced nav item component */
  const NavItem = ({ href, icon, label, badge }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out",
          "hover:scale-[1.02] hover:shadow-sm",
          active
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white"
        )}
      >
        <div className={cn(
          "transition-transform duration-200",
          "group-hover:scale-110",
          active ? "text-white" : "text-gray-500 group-hover:text-blue-500"
        )}>
          {icon}
        </div>
        
        <span className="flex-1 truncate">{label}</span>
        
        {badge && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            active 
              ? "bg-white/20 text-white" 
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
          )}>
            {badge}
          </span>
        )}
        
        <ChevronRight className={cn(
          "h-4 w-4 transition-all duration-200",
          active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
        )} />
      </Link>
    );
  };

  /* Role badge component */
  const RoleBadge = ({ role }) => (
    <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 p-3 dark:from-emerald-900/20 dark:to-blue-900/20">
      <div className="rounded-full bg-emerald-500 p-1">
        <Zap className="h-3 w-3 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-900 dark:text-white">Active Role</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{role}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Enhanced mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed left-4 top-4 z-50 lg:hidden",
          "rounded-full bg-white/90 backdrop-blur-sm shadow-lg border",
          "hover:bg-white hover:scale-110 transition-all duration-200",
          "dark:bg-gray-900/90 dark:hover:bg-gray-900"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="relative">
          <Menu className={cn(
            "h-5 w-5 transition-all duration-300",
            open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
          )} />
          <X className={cn(
            "absolute inset-0 h-5 w-5 transition-all duration-300",
            open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          )} />
        </div>
      </Button>

      {/* Enhanced overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Enhanced sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col",
          "bg-white/95 backdrop-blur-xl border-r border-gray-200/50",
          "dark:bg-gray-900/95 dark:border-gray-800/50",
          "transition-all duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Enhanced brand section */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <Link
            href="/"
            className="group flex items-center gap-3 text-xl font-bold transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-blue-500 blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
              NotifyPanel
            </span>
          </Link>
        </div>

        {/* Role badge */}
        <div className="p-6 pb-4">
          <RoleBadge role={role} />
        </div>

        {/* Enhanced navigation */}
        <nav className="flex-1 px-6 pb-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </nav>

        {/* Enhanced footer section */}
        <div className="p-6 pt-0 space-y-3 border-t border-gray-200/50 dark:border-gray-800/50">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}