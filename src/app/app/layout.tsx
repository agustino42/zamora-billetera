"use client";

import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";
import { STUDENT_NAV, STUDENT_MOBILE_NAV } from "@/lib/config";

export default function StudentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard roles={["student"]}>
      <AppShell
        nav={STUDENT_NAV}
        mobileNav={STUDENT_MOBILE_NAV}
        roleLabel="Estudiante"
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
