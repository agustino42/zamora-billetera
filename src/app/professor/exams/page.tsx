"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoSubjects } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

interface Exam {
  id: string;
  subjectName: string;
  title: string;
  date: string;
  weight: number;
  status: "programado" | "en curso" | "calificado";
}

const seed: Exam[] = [
  { id: "ex-1", subjectName: "Estructuras de Datos", title: "Parcial 1", date: "2026-10-22T15:00:00Z", weight: 30, status: "programado" },
  { id: "ex-2", subjectName: "Bases de Datos", title: "Práctico calificado", date: "2026-10-08T15:00:00Z", weight: 20, status: "calificado" },
  { id: "ex-3", subjectName: "Blockchain y Web3", title: "Final", date: "2026-11-28T15:00:00Z", weight: 40, status: "programado" },
];

export default function ProfessorExamsPage() {
  const [exams, setExams] = useState<Exam[]>(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subjectId: demoSubjects[0].id,
    title: "",
    date: "",
    weight: "30",
  });

  const create = () => {
    if (!form.title) {
      toast.error("Escribe un título");
      return;
    }
    const subject = demoSubjects.find((s) => s.id === form.subjectId)!;
    setExams((prev) => [
      {
        id: `ex-${Date.now()}`,
        subjectName: subject.name,
        title: form.title,
        date: form.date || new Date().toISOString(),
        weight: Number(form.weight) || 0,
        status: "programado",
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ ...form, title: "", date: "" });
    toast.success("Examen programado");
  };

  const columns: Column<Exam>[] = [
    {
      key: "title",
      header: "Examen",
      primary: true,
      render: (e) => (
        <div>
          <p className="font-medium">{e.title}</p>
          <p className="text-xs text-muted-foreground">{e.subjectName}</p>
        </div>
      ),
    },
    { key: "date", header: "Fecha", sortValue: (e) => e.date, render: (e) => formatDate(e.date) },
    { key: "weight", header: "Peso", render: (e) => `${e.weight}%` },
    {
      key: "status",
      header: "Estado",
      render: (e) => (
        <Badge
          variant={
            e.status === "calificado"
              ? "success"
              : e.status === "en curso"
                ? "warning"
                : "outline"
          }
        >
          {e.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: () => (
        <Button size="sm" variant="outline" onClick={() => toast.info("Sube las notas en 'Notas'")}>
          <FileText className="h-3.5 w-3.5" /> Calificar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Exámenes"
        description="Programa exámenes y publica sus resultados."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Programar examen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Programar examen</DialogTitle>
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
                  <Label htmlFor="etitle">Título</Label>
                  <Input
                    id="etitle"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edate">Fecha</Label>
                    <Input
                      id="edate"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eweight">Peso (%)</Label>
                    <Input
                      id="eweight"
                      type="number"
                      value={form.weight}
                      onChange={(e) =>
                        setForm({ ...form, weight: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" onClick={create}>
                  Programar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={exams} searchable searchKeys={["title", "subjectName"]} />
    </div>
  );
}
