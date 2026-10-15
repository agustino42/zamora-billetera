"use client";

import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import { demoGrades } from "@/lib/mock-data";
import type { Grade } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminGradesPage() {
  const columns: Column<Grade>[] = [
    { key: "student", header: "Alumno", primary: true, render: (g) => <span className="font-medium">{g.studentName}</span> },
    { key: "subject", header: "Materia", render: (g) => g.subjectName },
    { key: "score", header: "Nota", sortValue: (g) => g.score, render: (g) => <Badge variant={g.passed ? "success" : "danger"}>{g.score}/20</Badge> },
    { key: "credits", header: "Créditos", render: (g) => g.creditsEarned },
    { key: "zam", header: "ZAM", render: (g) => <span className="font-bold text-brand">{g.creditsEarned * 100}</span> },
    { key: "date", header: "Fecha", render: (g) => formatDate(g.recordedAt) },
  ];

  return (
    <div>
      <PageHeader title="Notas y créditos" description="Supervisa las notas registradas y los créditos acuñados." />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Notas" value={demoGrades.length} icon={<GraduationCap className="h-4 w-4" />} accent />
        <StatCard label="Aprobadas" value={demoGrades.filter((g) => g.passed).length} />
        <StatCard label="Créditos" value={demoGrades.reduce((a, g) => a + g.creditsEarned, 0)} />
        <StatCard label="ZAM acuñados" value={demoGrades.reduce((a, g) => a + g.creditsEarned * 100, 0)} />
      </div>
      <DataTable columns={columns} data={demoGrades} searchable searchKeys={["studentName", "subjectName"]} />
    </div>
  );
}
