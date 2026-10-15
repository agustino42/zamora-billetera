"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileUp, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { demoGrades, demoStudents, demoSubjects } from "@/lib/mock-data";
import type { Grade } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ProfessorGradesPage() {
  const [grades, setGrades] = useState<Grade[]>(demoGrades);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: demoStudents[0].id,
    subjectId: demoSubjects[0].id,
    score: "16",
    credits: "4",
  });

  const record = () => {
    const student = demoStudents.find((s) => s.id === form.studentId)!;
    const subject = demoSubjects.find((s) => s.id === form.subjectId)!;
    const score = Number(form.score);
    const credits = Number(form.credits);
    const passed = score >= 12;
    setGrades((prev) => [
      {
        id: `gr-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        subjectId: subject.id,
        subjectName: subject.name,
        score,
        creditsEarned: passed ? credits : 0,
        passed,
        recordedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setOpen(false);
    toast.success(
      passed
        ? `Nota registrada · ${credits * 100} ZAMORA acuñados`
        : "Nota registrada (desaprobada, sin acuñación)",
      { description: `${student.name} · ${subject.name}` },
    );
  };

  const columns: Column<Grade>[] = [
    {
      key: "student",
      header: "Alumno",
      primary: true,
      render: (g) => <span className="font-medium">{g.studentName}</span>,
    },
    { key: "subject", header: "Materia", render: (g) => g.subjectName },
    {
      key: "score",
      header: "Nota",
      sortValue: (g) => g.score,
      render: (g) => (
        <Badge variant={g.passed ? "success" : "danger"}>{g.score}/20</Badge>
      ),
    },
    {
      key: "credits",
      header: "Créditos",
      render: (g) => `${g.creditsEarned} créditos`,
    },
    {
      key: "zam",
      header: "ZAM otorgados",
      render: (g) => (
        <span className="font-bold text-brand">
          {g.creditsEarned * 100}
        </span>
      ),
    },
    { key: "date", header: "Fecha", render: (g) => formatDate(g.recordedAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Notas y créditos"
        description="Sube notas. Cada crédito aprobado acuña 100 ZAMORA automáticamente para el alumno."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <FileUp className="h-4 w-4" /> Registrar nota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar nota</DialogTitle>
                <DialogDescription>
                  La nota se guarda como hash on-chain; el valor vive en Supabase.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Alumno</Label>
                  <Select
                    value={form.studentId}
                    onValueChange={(v) => setForm({ ...form, studentId: v })}
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="score">Nota (0-20)</Label>
                    <Input
                      id="score"
                      type="number"
                      max={20}
                      value={form.score}
                      onChange={(e) => setForm({ ...form, score: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Créditos</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={form.credits}
                      onChange={(e) =>
                        setForm({ ...form, credits: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" onClick={record}>
                  <GraduationCap className="h-4 w-4" /> Guardar y acuñar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={grades}
        searchable
        searchKeys={["studentName", "subjectName"]}
      />
    </div>
  );
}
