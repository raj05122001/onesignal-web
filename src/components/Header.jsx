// components/Header.jsx
"use client";

/**
 * Global top-bar visible on every authenticated page
 * ──────────────────────────────────────────────────
 * • Shows optional `title` (page heading)
 * • Theme toggle (light / dark)
 * • Current user email + Logout button
 *
 * Dependencies:
 *   • shadcn/ui  — Button, DropdownMenu
 *   • lucide-react icons
 *   • next-auth/react  — signOut()
 *   • next-themes      — useTheme()
 */

import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/utils/classNames";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/* ─────────────────────────────────────────
   Props
───────────────────────────────────────── */
export default function Header({ title = "", user }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is mounted on client before rendering icons
  useEffect(() => setMounted(true), []);

  /* Theme toggle */
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-zinc-900 lg:px-6">
      {/* Left – optional page title */}
      <h1
        className={cn(
          "line-clamp-1 text-base font-semibold tracking-tight",
          !title && "sr-only"
        )}
      >
        {title}
      </h1>

      {/* Right – user actions */}
      <div className="flex items-center gap-2">
        {/* Theme switch */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="hidden sm:inline-flex"
          >
            {theme === "dark" ? (
              <Sun className="h-[1.1rem] w-[1.1rem]" />
            ) : (
              <Moon className="h-[1.1rem] w-[1.1rem]" />
            )}
          </Button>
        )}

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <span className="hidden max-w-[140px] truncate sm:inline">
                {user?.email}
              </span>
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="opacity-60">
              Signed in as
              <br />
              <span className="font-semibold">{user?.role}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
