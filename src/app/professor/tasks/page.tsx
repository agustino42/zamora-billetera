"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoSubjects, demoTasks } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUS: Record<Task["status"], { label: string; variant: "muted" | "warning" | "success" | "danger" }> = {
  pending: { label: "Sin entregas", variant: "muted" },
  submitted: { label: "Por revisar", variant: "warning" },
  approved: { label: "Aprobada", variant: "success" },
  rejected: { label: "Rechazada", variant: "danger" },
};

export default function ProfessorTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subjectId: demoSubjects[0].id,
    title: "",
    description: "",
    reward: "50",
  });

  const create = () => {
    if (!form.title.trim()) {
      toast.error("Escribe un título");
      return;
    }
    const subject = demoSubjects.find((s) => s.id === form.subjectId)!;
    setTasks((prev) => [
      {
        id: `tsk-${Date.now()}`,
        subjectId: subject.id,
        subjectName: subject.name,
        title: form.title,
        description: form.description || "Sin descripción",
        reward: Number(form.reward) || 0,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        status: "pending",
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ ...form, title: "", description: "" });
    toast.success("Tarea creada", {
      description: "Tus alumnos ya pueden verla y entregarla.",
    });
  };

  const review = (task: Task, approve: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: approve ? "approved" : "rejected" }
          : t,
      ),
    );
    toast.success(
      approve
        ? `Aprobada · se acuñaron ${task.reward} ZAMORA`
        : "Entrega rechazada",
    );
  };

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
    {
      key: "reward",
      header: "Recompensa",
      sortValue: (t) => t.reward,
      render: (t) => (
        <span className="font-bold text-brand">+{t.reward} ZAM</span>
      ),
    },
    {
      key: "due",
      header: "Vence",
      sortValue: (t) => t.dueDate,
      render: (t) => formatDate(t.dueDate),
    },
    {
      key: "status",
      header: "Estado",
      render: (t) => (
        <Badge variant={STATUS[t.status].variant}>{STATUS[t.status].label}</Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (t) =>
        t.status === "submitted" ? (
          <div className="flex gap-2">
            <Button size="sm" variant="gradient" onClick={() => review(t, true)}>
              <Check className="h-3.5 w-3.5" /> Aprobar
            </Button>
            <Button size="sm" variant="outline" onClick={() => review(t, false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tareas"
        description="Crea tareas, revisa entregas y libera ZAMORA al aprobarlas."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Nueva tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Materia</Label>
                  <Select
                    value={form.subjectId}
                    onValueChange={(v) => setForm({ ...form, subjectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {demoSubjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Descripción</Label>
                  <Textarea
                    id="desc"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward">Recompensa (ZAM)</Label>
                  <Input
                    id="reward"
                    type="number"
                    value={form.reward}
                    onChange={(e) => setForm({ ...form, reward: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" onClick={create}>
                  Crear tarea
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={tasks}
        searchable
        searchKeys={["title", "subjectName"]}
      />
    </div>
  );
}
