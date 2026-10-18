"use client";

import { useState } from "react";
import { toast } from "sonner";
import { keccak256, toBytes } from "viem";
import { CalendarCheck, CalendarPlus, Loader2, StopCircle } from "lucide-react";
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
import { demoAttendanceSessions, demoSubjects } from "@/lib/mock-data";
import type { AttendanceSession } from "@/lib/types";
import { onchainId, staffRelay } from "@/lib/onchain/relay-client";
import { relativeTime, shortAddress } from "@/lib/utils";

function genCode() {
  return `ZAM-${Math.floor(1000 + Math.random() * 8999)}`;
}

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>(
    demoAttendanceSessions,
  );
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    subjectId: demoSubjects[0].id,
    code: genCode(),
    duration: "1800",
  });

  const openSession = async () => {
    const subject = demoSubjects.find((s) => s.id === form.subjectId);
    if (!subject) {
      toast.error("Selecciona una materia");
      return;
    }
    const code = form.code.trim().toUpperCase();
    const durationSeconds = Number(form.duration);
    if (!code || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      toast.error("Código y duración inválidos");
      return;
    }
    const subjectId = onchainId(subject.id);
    if (!subjectId) {
      toast.error("Aún no está on-chain");
      return;
    }
    const codeHash = keccak256(toBytes(code));
    setPending(true);
    try {
      const res = await staffRelay(
        "attendance-open",
        { subjectId, codeHash, durationSeconds },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setSessions((prev) => [
        {
          id: `ses-${Date.now()}`,
          subjectId: subject.id,
          subjectName: subject.name,
          code,
          openedAt: new Date().toISOString(),
          closesAt: new Date(Date.now() + durationSeconds * 1000).toISOString(),
          closed: false,
          checkedInCount: 0,
        },
        ...prev,
      ]);
      setOpen(false);
      setForm({ ...form, code: genCode() });
      toast.success("Sesión de asistencia abierta on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al abrir la sesión.",
      );
    } finally {
      setPending(false);
    }
  };

  const closeSession = async (s: AttendanceSession) => {
    const sessionId = onchainId(s.id);
    if (!sessionId) {
      toast.error("Aún no está on-chain");
      return;
    }
    setClosingId(s.id);
    try {
      const res = await staffRelay("attendance-close", { sessionId }, "admin");
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setSessions((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, closed: true } : x)),
      );
      toast.success("Sesión cerrada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cerrar la sesión.",
      );
    } finally {
      setClosingId(null);
    }
  };

  const columns: Column<AttendanceSession>[] = [
    {
      key: "subject",
      header: "Sesión",
      primary: true,
      render: (s) => (
        <div>
          <p className="font-medium">{s.subjectName}</p>
          <p className="text-xs text-muted-foreground">Código {s.code}</p>
        </div>
      ),
    },
    { key: "opened", header: "Abierta", sortValue: (s) => s.openedAt, render: (s) => relativeTime(s.openedAt) },
    { key: "present", header: "Presentes", sortValue: (s) => s.checkedInCount, render: (s) => s.checkedInCount },
    {
      key: "status",
      header: "Estado",
      render: (s) => (
        <Badge variant={s.closed ? "muted" : "success"}>
          {s.closed ? "Cerrada" : "Activa"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (s) =>
        s.closed ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={closingId === s.id}
            onClick={() => closeSession(s)}
          >
            {closingId === s.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <StopCircle className="h-3.5 w-3.5" />
            )}{" "}
            Cerrar
          </Button>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Asistencia"
        description="Registro global de sesiones de asistencia."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <CalendarPlus className="h-4 w-4" /> Abrir sesión
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir sesión de asistencia</DialogTitle>
                <DialogDescription>
                  Se abre on-chain con código hasheado y duración limitada.
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
                  <Label htmlFor="acode">Código</Label>
                  <Input
                    id="acode"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    className="font-mono tracking-widest uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aduration">Duración (segundos)</Label>
                  <Input
                    id="aduration"
                    type="number"
                    min={60}
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" disabled={pending} onClick={openSession}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarCheck className="h-4 w-4" />
                  )}{" "}
                  Abrir sesión
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Sesiones" value={sessions.length} icon={<CalendarCheck className="h-4 w-4" />} accent />
        <StatCard label="Activas" value={sessions.filter((s) => !s.closed).length} />
        <StatCard label="Registros" value={34890} hint="Histórico campus" />
        <StatCard label="Asistencia media" value="91%" />
      </div>
      <DataTable columns={columns} data={sessions} searchable searchKeys={["subjectName", "code"]} />
    </div>
  );
}
