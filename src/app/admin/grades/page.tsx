"use client";

import { useState } from "react";
import { toast } from "sonner";
import { keccak256, toBytes } from "viem";
import { FileUp, GraduationCap, Loader2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
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
import { onchainId, staffRelay } from "@/lib/onchain/relay-client";
import { formatDate, shortAddress } from "@/lib/utils";
import type { Grade } from "@/lib/types";

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<Grade[]>(demoGrades);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    studentId: demoStudents[0].id,
    subjectId: demoSubjects[0].id,
    score: "16",
    credits: "4",
  });

  const record = async () => {
    const student = demoStudents.find((s) => s.id === form.studentId);
    const subject = demoSubjects.find((s) => s.id === form.subjectId);
    if (!student || !subject) {
      toast.error("Selecciona alumno y materia");
      return;
    }
    const score = Number(form.score);
    const credits = Number(form.credits);
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
    setPending(true);
    try {
      const res = await staffRelay(
        "grade-record",
        { subjectId, student: studentAddress, scoreHash, creditsEarned, passed },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setGrades((prev) => [
        {
          id: `gr-${Date.now()}`,
          studentId: student.id,
          studentName: student.name,
          subjectId: subject.id,
          subjectName: subject.name,
          score,
          creditsEarned,
          passed,
          recordedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setOpen(false);
      toast.success("Nota registrada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al registrar la nota.",
      );
    } finally {
      setPending(false);
    }
  };

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
      <PageHeader
        title="Notas y créditos"
        description="Supervisa las notas registradas y los créditos acuñados."
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
                  La nota se registra on-chain como hash; el valor vive en Supabase.
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
                <Button variant="gradient" disabled={pending} onClick={record}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GraduationCap className="h-4 w-4" />
                  )}{" "}
                  Guardar on-chain
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Notas" value={grades.length} icon={<GraduationCap className="h-4 w-4" />} accent />
        <StatCard label="Aprobadas" value={grades.filter((g) => g.passed).length} />
        <StatCard label="Créditos" value={grades.reduce((a, g) => a + g.creditsEarned, 0)} />
        <StatCard label="ZAM acuñados" value={grades.reduce((a, g) => a + g.creditsEarned * 100, 0)} />
      </div>
      <DataTable columns={columns} data={grades} searchable searchKeys={["studentName", "subjectName"]} />
    </div>
  );
}
