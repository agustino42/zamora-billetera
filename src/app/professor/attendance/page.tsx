"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { CalendarPlus, CheckCircle2, StopCircle } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  demoAttendanceSessions,
  demoStudents,
  demoSubjects,
} from "@/lib/mock-data";
import type { AttendanceSession } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

function genCode() {
  return `ZAM-${Math.floor(1000 + Math.random() * 8999)}`;
}

export default function ProfessorAttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>(
    demoAttendanceSessions,
  );
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState(demoSubjects[0].id);
  const [active, setActive] = useState<AttendanceSession | null>(
    demoAttendanceSessions.find(
      (s) => !s.closed && new Date(s.closesAt) > new Date(),
    ) ?? null,
  );

  const openSession = () => {
    const subject = demoSubjects.find((s) => s.id === subjectId)!;
    const session: AttendanceSession = {
      id: `ses-${Date.now()}`,
      subjectId: subject.id,
      subjectName: subject.name,
      code: genCode(),
      openedAt: new Date().toISOString(),
      closesAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      closed: false,
      checkedInCount: 0,
    };
    setSessions((prev) => [session, ...prev]);
    setActive(session);
    setOpen(false);
    toast.success("Sesión de asistencia abierta", {
      description: `Código ${session.code} · válido 30 minutos.`,
    });
  };

  const close = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, closed: true } : s)),
    );
    if (active?.id === id) setActive(null);
    toast.info("Sesión cerrada");
  };

  return (
    <div>
      <PageHeader
        title="Asistencia"
        description="Abre una sesión con código temporal. Tus alumnos firman su presencia on-chain."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <CalendarPlus className="h-4 w-4" /> Abrir asistencia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir sesión</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label>Materia</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
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
              <DialogFooter>
                <Button variant="gradient" onClick={openSession}>
                  Generar código
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Historial de sesiones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border/60 p-4"
              >
                <div>
                  <p className="font-medium">{s.subjectName}</p>
                  <p className="text-xs text-muted-foreground">
                    Código {s.code} · {s.checkedInCount} presentes ·{" "}
                    {relativeTime(s.openedAt)}
                  </p>
                </div>
                {s.closed ? (
                  <Badge variant="muted">Cerrada</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => close(s.id)}
                  >
                    <StopCircle className="h-3.5 w-3.5" /> Cerrar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          {active ? (
            <Card className="overflow-hidden">
              <div className="bg-ink-gradient p-5 text-center text-white">
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Código activo
                </p>
                <p className="mt-1 font-display text-3xl font-black tracking-widest">
                  {active.code}
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Cierra {relativeTime(active.closesAt)}
                </p>
              </div>
              <CardContent className="flex flex-col items-center p-5">
                <div className="rounded-2xl bg-white p-3">
                  <QRCodeSVG
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/app/attendance?code=${active.code}`}
                    size={150}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {active.checkedInCount} de {demoStudents.length * 8} alumnos
                  registrados
                </p>
              </CardContent>
            </Card>
          ) : (
            <StatCard
              label="Sesión"
              value="Inactiva"
              hint="Abre una asistencia para empezar"
              icon={<CheckCircle2 className="h-4 w-4" />}
              accent
            />
          )}
        </div>
      </div>
    </div>
  );
}
