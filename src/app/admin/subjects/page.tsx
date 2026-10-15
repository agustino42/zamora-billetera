"use client";

import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { demoSubjects } from "@/lib/mock-data";
import type { Subject } from "@/lib/types";

export default function AdminSubjectsPage() {
  const columns: Column<Subject>[] = [
    {
      key: "name",
      header: "Materia",
      primary: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full" style={{ background: s.color }} />
          <div>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.code}</p>
          </div>
        </div>
      ),
    },
    { key: "professor", header: "Profesor", render: (s) => s.professorName },
    { key: "credits", header: "Créditos", sortValue: (s) => s.credits, render: (s) => s.credits },
    { key: "enrolled", header: "Inscritos", sortValue: (s) => s.enrolled, render: (s) => s.enrolled },
    { key: "status", header: "Estado", render: () => <Badge variant="success">Activa</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Materias"
        description="Vista global de todas las materias del campus."
      />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Materias" value={demoSubjects.length} icon={<BookOpen className="h-4 w-4" />} accent />
        <StatCard label="Profesores" value={new Set(demoSubjects.map((s) => s.professorId)).size} />
        <StatCard label="Créditos totales" value={demoSubjects.reduce((a, s) => a + s.credits, 0)} />
        <StatCard label="Inscritos" value={demoSubjects.reduce((a, s) => a + s.enrolled, 0)} />
      </div>
      <DataTable columns={columns} data={demoSubjects} searchable searchKeys={["name", "code", "professorName"]} />
    </div>
  );
}
