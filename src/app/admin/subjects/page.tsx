"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, BookPlus, Loader2, UserPlus } from "lucide-react";
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
import { demoProfessors, demoStudents, demoSubjects } from "@/lib/mock-data";
import type { Subject } from "@/lib/types";
import { onchainId, staffRelay } from "@/lib/onchain/relay-client";
import { shortAddress } from "@/lib/utils";

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(demoSubjects);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [enrollSubject, setEnrollSubject] = useState<Subject | null>(null);
  const [enrollStudentId, setEnrollStudentId] = useState(demoStudents[0].id);
  const [enrolling, setEnrolling] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    credits: "3",
    professorId: demoProfessors[0].id,
  });

  const resolveAddress = (wallet: string) =>
    wallet.startsWith("0x") && wallet.length === 42
      ? wallet
      : PLACEHOLDER_ADDRESS;

  const create = async () => {
    const code = form.code.trim();
    const name = form.name.trim();
    const credits = Number(form.credits);
    const professor = demoProfessors.find((p) => p.id === form.professorId);
    if (!code || !name || !professor) {
      toast.error("Completa código, nombre y profesor");
      return;
    }
    if (!Number.isFinite(credits) || credits <= 0 || credits > 10) {
      toast.error("Créditos inválidos");
      return;
    }
    setPending(true);
    try {
      const res = await staffRelay(
        "subject-create",
        { code, name, credits, professor: resolveAddress(professor.wallet) },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setSubjects((prev) => [
        {
          id: `sub-${Date.now()}`,
          code,
          name,
          credits,
          professorId: professor.id,
          professorName: professor.name,
          color: "#FF6A00",
          enrolled: 0,
        },
        ...prev,
      ]);
      setOpen(false);
      setForm({ ...form, code: "", name: "", credits: "3" });
      toast.success("Materia creada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la materia.",
      );
    } finally {
      setPending(false);
    }
  };

  const enroll = async () => {
    if (!enrollSubject) return;
    const student = demoStudents.find((s) => s.id === enrollStudentId);
    if (!student) {
      toast.error("Selecciona un alumno");
      return;
    }
    const subjectId = onchainId(enrollSubject.id);
    if (!subjectId) {
      toast.error("Aún no está on-chain");
      return;
    }
    setEnrolling(true);
    try {
      const res = await staffRelay(
        "enroll-student",
        { subjectId, student: resolveAddress(student.wallet) },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === enrollSubject.id ? { ...s, enrolled: s.enrolled + 1 } : s,
        ),
      );
      setEnrollSubject(null);
      toast.success(`${student.name} inscrito en ${enrollSubject.name}`, {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al inscribir al alumno.",
      );
    } finally {
      setEnrolling(false);
    }
  };

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
    {
      key: "actions",
      header: "Acciones",
      render: (s) => (
        <Button
          size="sm"
          variant="outline"
          disabled={enrolling && enrollSubject?.id === s.id}
          onClick={() => setEnrollSubject(s)}
        >
          {enrolling && enrollSubject?.id === s.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UserPlus className="h-3.5 w-3.5" />
          )}{" "}
          Inscribir
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Materias"
        description="Vista global de todas las materias del campus."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <BookPlus className="h-4 w-4" /> Nueva materia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear materia</DialogTitle>
                <DialogDescription>
                  Se registra on-chain con el profesor asignado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="scode">Código</Label>
                    <Input
                      id="scode"
                      placeholder="INF-306"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scredits">Créditos</Label>
                    <Input
                      id="scredits"
                      type="number"
                      min={1}
                      max={10}
                      value={form.credits}
                      onChange={(e) =>
                        setForm({ ...form, credits: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sname">Nombre</Label>
                  <Input
                    id="sname"
                    placeholder="Blockchain y Web3"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profesor</Label>
                  <Select
                    value={form.professorId}
                    onValueChange={(v) => setForm({ ...form, professorId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {demoProfessors.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" disabled={pending} onClick={create}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookPlus className="h-4 w-4" />
                  )}{" "}
                  Crear materia
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Materias" value={subjects.length} icon={<BookOpen className="h-4 w-4" />} accent />
        <StatCard label="Profesores" value={new Set(subjects.map((s) => s.professorId)).size} />
        <StatCard label="Créditos totales" value={subjects.reduce((a, s) => a + s.credits, 0)} />
        <StatCard label="Inscritos" value={subjects.reduce((a, s) => a + s.enrolled, 0)} />
      </div>
      <DataTable columns={columns} data={subjects} searchable searchKeys={["name", "code", "professorName"]} />

      <Dialog
        open={enrollSubject !== null}
        onOpenChange={(o) => {
          if (!o) setEnrollSubject(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribir alumno</DialogTitle>
            <DialogDescription>
              {enrollSubject
                ? `Inscripción on-chain en ${enrollSubject.name}.`
                : "Selecciona el alumno a inscribir."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Alumno</Label>
            <Select
              value={enrollStudentId}
              onValueChange={setEnrollStudentId}
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
          <DialogFooter>
            <Button variant="gradient" disabled={enrolling} onClick={enroll}>
              {enrolling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}{" "}
              Inscribir on-chain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
