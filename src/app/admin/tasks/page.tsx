"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList, ClipboardPlus, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { onchainId, staffRelay } from "@/lib/onchain/relay-client";
import { formatDate, shortAddress } from "@/lib/utils";

const STATUS: Record<Task["status"], { label: string; variant: "muted" | "warning" | "success" | "danger" }> = {
  pending: { label: "Pendiente", variant: "muted" },
  submitted: { label: "Entregada", variant: "warning" },
  approved: { label: "Aprobada", variant: "success" },
  rejected: { label: "Rechazada", variant: "danger" },
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    subjectId: demoSubjects[0].id,
    title: "",
    description: "",
    reward: "50",
  });

  const create = async () => {
    const subject = demoSubjects.find((s) => s.id === form.subjectId);
    const title = form.title.trim();
    const description = form.description.trim();
    const reward = Number(form.reward);
    if (!subject || !title || !description) {
      toast.error("Completa materia, título y descripción");
      return;
    }
    if (!Number.isFinite(reward) || reward <= 0) {
      toast.error("Recompensa inválida");
      return;
    }
    const subjectId = onchainId(subject.id);
    if (!subjectId) {
      toast.error("Aún no está on-chain");
      return;
    }
    setPending(true);
    try {
      const res = await staffRelay(
        "task-create",
        { subjectId, title, description, reward },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setTasks((prev) => [
        {
          id: `tsk-${Date.now()}`,
          subjectId: subject.id,
          subjectName: subject.name,
          title,
          description,
          reward,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
        },
        ...prev,
      ]);
      setOpen(false);
      setForm({ ...form, title: "", description: "", reward: "50" });
      toast.success("Tarea creada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la tarea.",
      );
    } finally {
      setPending(false);
    }
  };

  const review = async (t: Task, approve: boolean) => {
    const submissionId = onchainId(t.id);
    if (!submissionId) {
      toast.error("Aún no está on-chain");
      return;
    }
    setPendingId(t.id);
    try {
      const res = await staffRelay(
        "task-review",
        { submissionId, approve },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setTasks((prev) =>
        prev.map((x) =>
          x.id === t.id
            ? { ...x, status: approve ? ("approved" as const) : ("rejected" as const) }
            : x,
        ),
      );
      toast.success(approve ? "Entrega aprobada on-chain" : "Entrega rechazada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al revisar la entrega.",
      );
    } finally {
      setPendingId(null);
    }
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
    { key: "reward", header: "Recompensa", sortValue: (t) => t.reward, render: (t) => <span className="font-bold text-brand">+{t.reward} ZAM</span> },
    { key: "due", header: "Vence", sortValue: (t) => t.dueDate, render: (t) => formatDate(t.dueDate) },
    { key: "status", header: "Estado", render: (t) => <Badge variant={STATUS[t.status].variant}>{STATUS[t.status].label}</Badge> },
    {
      key: "actions",
      header: "Acciones",
      render: (t) =>
        t.status === "submitted" ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pendingId === t.id}
              onClick={() => review(t, true)}
            >
              {pendingId === t.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsUp className="h-3.5 w-3.5" />
              )}{" "}
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pendingId === t.id}
              onClick={() => review(t, false)}
            >
              {pendingId === t.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsDown className="h-3.5 w-3.5" />
              )}{" "}
              Rechazar
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
        description="Supervisa todas las tareas y su estado de aprobación."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <ClipboardPlus className="h-4 w-4" /> Nueva tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear tarea</DialogTitle>
                <DialogDescription>
                  Se crea on-chain para la materia seleccionada.
                </DialogDescription>
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
                  <Label htmlFor="ttitle">Título</Label>
                  <Input
                    id="ttitle"
                    placeholder="Implementar árbol AVL"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tdesc">Descripción</Label>
                  <Input
                    id="tdesc"
                    placeholder="Detalles de la tarea..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treward">Recompensa (ZAM)</Label>
                  <Input
                    id="treward"
                    type="number"
                    min={1}
                    value={form.reward}
                    onChange={(e) => setForm({ ...form, reward: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" disabled={pending} onClick={create}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardPlus className="h-4 w-4" />
                  )}{" "}
                  Crear tarea
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Tareas" value={tasks.length} icon={<ClipboardList className="h-4 w-4" />} accent />
        <StatCard label="Aprobadas" value={tasks.filter((t) => t.status === "approved").length} />
        <StatCard label="Por revisar" value={tasks.filter((t) => t.status === "submitted").length} />
        <StatCard label="ZAM repartidos" value={tasks.filter((t) => t.status === "approved").reduce((a, t) => a + t.reward, 0)} />
      </div>
      <DataTable columns={columns} data={tasks} searchable searchKeys={["title", "subjectName"]} />
    </div>
  );
}
