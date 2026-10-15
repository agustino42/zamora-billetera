"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/components/session-provider";
import type { Role } from "@/lib/types";
import { Loader2 } from "lucide-react";

export function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { session, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!roles.includes(session.role)) {
      router.replace(
        session.role === "admin"
          ? "/admin"
          : session.role === "professor"
            ? "/professor"
            : "/app",
      );
    }
  }, [session, loading, roles, router, pathname]);

  if (loading || !session || !roles.includes(session.role)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <p className="text-sm">Verificando acceso…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
