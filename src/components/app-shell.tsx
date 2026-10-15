"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { ZamoraLogo } from "@/components/brand/logo";
import { NavIcon } from "@/components/nav-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/session-provider";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function AppShell({
  children,
  nav,
  mobileNav,
  roleLabel,
}: {
  children: React.ReactNode;
  nav: readonly NavItem[];
  mobileNav?: readonly NavItem[];
  roleLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useSession();
  const [open, setOpen] = useState(false);

  const initials = (session?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isActive = (href: string) =>
    href === pathname || (href !== "/" && pathname.startsWith(href));

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/">
          <ZamoraLogo />
        </Link>
      </div>
      <div className="px-3">
        <Badge variant="outline" className="mb-3 w-full justify-center py-1">
          {roleLabel}
        </Badge>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 no-scrollbar">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <NavIcon name={item.icon} className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {session?.name ?? "Invitado"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session?.email ?? "demo@zamora"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        {SidebarContent}
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/">
          <ZamoraLogo />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-border"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
          {children}
        </div>
      </main>

      {mobileNav && mobileNav.length > 0 && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around">
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive(item.href)
                    ? "text-brand"
                    : "text-muted-foreground",
                )}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
