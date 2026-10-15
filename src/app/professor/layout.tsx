"use client";

import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";
import { PROFESSOR_NAV } from "@/lib/config";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard roles={["professor", "admin"]}>
      <AppShell nav={PROFESSOR_NAV} roleLabel="Panel del profesor">
        {children}
      </AppShell>
    </RoleGuard>
  );
}
