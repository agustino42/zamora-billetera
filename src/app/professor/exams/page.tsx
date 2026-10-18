"use client";

import { useState } from "react";
import { toast } from "sonner";
import { keccak256, toBytes } from "viem";
import { FileText, Loader2, Plus } from "lucide-react";
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
import { demoStudents, demoSubjects } from "@/lib/mock-data";
import { onchainId, staffRelay } from "@/lib/onchain/relay-client";
import { formatDate, shortAddress } from "@/lib/utils";

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

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
  const [grading, setGrading] = useState<Exam | null>(null);
  const [gradePending, setGradePending] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentId: demoStudents[0].id,
    score: "16",
    credits: "4",
  });
  const [form, setForm] = useState({
    subjectId: demoSubjects[0].id,
    title: "",
    date: "",
    weight: "30",
  });

  const grade = async () => {
    if (!grading) return;
    const student = demoStudents.find((s) => s.id === gradeForm.studentId);
    const subject = demoSubjects.find((s) => s.name === grading.subjectName);
    if (!student || !subject) {
      toast.error("No se pudo resolver el alumno o la materia");
      return;
    }
    const score = Number(gradeForm.score);
    const credits = Number(gradeForm.credits);
    if (
      !Number.isFinite(score) ||
      score < 0 ||
      score > 20 ||
      !Number.isFinite(credits) ||
      credits < 0
    ) {
      toast.error("Nota (0-20) y créditos inválidos");
      return;
    }
    const subjectId = onchainId(subject.id);
    if (!subjectId) {
      toast.error("Aún no está on-chain");
      return;
    }
    const studentAddress =
      student.wallet.startsWith("0x") && student.wallet.length === 42
        ? student.wallet
        : PLACEHOLDER_ADDRESS;
    const passed = score >= 12;
    const creditsEarned = passed ? credits : 0;
    const scoreHash = keccak256(toBytes(String(score)));
    setGradePending(true);
    try {
      const res = await staffRelay(
        "grade-record",
        { subjectId, student: studentAddress, scoreHash, creditsEarned, passed },
        "professor",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setExams((prev) =>
        prev.map((x) =>
          x.id === grading.id ? { ...x, status: "calificado" } : x,
        ),
      );
      setGrading(null);
      toast.success("Nota registrada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al registrar la nota.",
      );
    } finally {
      setGradePending(false);
    }
  };

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
      render: (e) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setGradeForm({
              studentId: demoStudents[0].id,
              score: "16",
              credits: "4",
            });
            setGrading(e);
          }}
        >
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

      <Dialog
        open={grading !== null}
        onOpenChange={(o) => {
          if (!o) setGrading(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar · {grading?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Alumno</Label>
              <Select
                value={gradeForm.studentId}
                onValueChange={(v) =>
                  setGradeForm({ ...gradeForm, studentId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {demoStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="exscore">Nota (0-20)</Label>
                <Input
                  id="exscore"
                  type="number"
                  max={20}
                  value={gradeForm.score}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, score: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excredits">Créditos</Label>
                <Input
                  id="excredits"
                  type="number"
                  value={gradeForm.credits}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, credits: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="gradient" disabled={gradePending} onClick={grade}>
              {gradePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}{" "}
              Registrar nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
