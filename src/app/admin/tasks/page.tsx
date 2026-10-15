"use client";

import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { demoTasks } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUS: Record<Task["status"], { label: string; variant: "muted" | "warning" | "success" | "danger" }> = {
  pending: { label: "Pendiente", variant: "muted" },
  submitted: { label: "Entregada", variant: "warning" },
  approved: { label: "Aprobada", variant: "success" },
  rejected: { label: "Rechazada", variant: "danger" },
};

export default function AdminTasksPage() {
  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Tarea",
      primary: true,
      render: (t) => (
        <div>
          <p className="font-medium">{t.title}</p>
          <p className="text-xs text-muted-foreground">{t.subjectName}</p>
        </div>
      ),
    },
    { key: "reward", header: "Recompensa", sortValue: (t) => t.reward, render: (t) => <span className="font-bold text-brand">+{t.reward} ZAM</span> },
    { key: "due", header: "Vence", sortValue: (t) => t.dueDate, render: (t) => formatDate(t.dueDate) },
    { key: "status", header: "Estado", render: (t) => <Badge variant={STATUS[t.status].variant}>{STATUS[t.status].label}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Tareas" description="Supervisa todas las tareas y su estado de aprobación." />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Tareas" value={demoTasks.length} icon={<ClipboardList className="h-4 w-4" />} accent />
        <StatCard label="Aprobadas" value={demoTasks.filter((t) => t.status === "approved").length} />
        <StatCard label="Por revisar" value={demoTasks.filter((t) => t.status === "submitted").length} />
        <StatCard label="ZAM repartidos" value={demoTasks.filter((t) => t.status === "approved").reduce((a, t) => a + t.reward, 0)} />
      </div>
      <DataTable columns={columns} data={demoTasks} searchable searchKeys={["title", "subjectName"]} />
    </div>
  );
}
