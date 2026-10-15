"use client";

import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck } from "lucide-react";
import { demoAttendanceSessions } from "@/lib/mock-data";
import type { AttendanceSession } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export default function AdminAttendancePage() {
  const columns: Column<AttendanceSession>[] = [
    {
      key: "subject",
      header: "Sesión",
      primary: true,
      render: (s) => (
        <div>
          <p className="font-medium">{s.subjectName}</p>
          <p className="text-xs text-muted-foreground">Código {s.code}</p>
        </div>
      ),
    },
    { key: "opened", header: "Abierta", sortValue: (s) => s.openedAt, render: (s) => relativeTime(s.openedAt) },
    { key: "present", header: "Presentes", sortValue: (s) => s.checkedInCount, render: (s) => s.checkedInCount },
    {
      key: "status",
      header: "Estado",
      render: (s) => (
        <Badge variant={s.closed ? "muted" : "success"}>
          {s.closed ? "Cerrada" : "Activa"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Asistencia" description="Registro global de sesiones de asistencia." />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Sesiones" value={demoAttendanceSessions.length} icon={<CalendarCheck className="h-4 w-4" />} accent />
        <StatCard label="Activas" value={demoAttendanceSessions.filter((s) => !s.closed).length} />
        <StatCard label="Registros" value={34890} hint="Histórico campus" />
        <StatCard label="Asistencia media" value="91%" />
      </div>
      <DataTable columns={columns} data={demoAttendanceSessions} searchable searchKeys={["subjectName", "code"]} />
    </div>
  );
}
