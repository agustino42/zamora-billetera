"use client";

import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";
import { ADMIN_NAV } from "@/lib/config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard roles={["admin"]}>
      <AppShell nav={ADMIN_NAV} roleLabel="Administración">
        {children}
      </AppShell>
    </RoleGuard>
  );
}
