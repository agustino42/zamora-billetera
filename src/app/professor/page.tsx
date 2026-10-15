"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ClipboardList,
  Coins,
  FileText,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  demoAttendanceSessions,
  demoGrades,
  demoStudents,
  demoSubjects,
  demoTasks,
} from "@/lib/mock-data";
import { relativeTime } from "@/lib/utils";

export default function ProfessorOverview() {
  const pendingReviews = demoTasks.filter((t) => t.status === "submitted").length;
  const activeSession = demoAttendanceSessions.find(
    (s) => !s.closed && new Date(s.closesAt) > new Date(),
  );

  return (
    <div>
      <PageHeader
        title="Resumen de tu cátedra"
        description="Gestiona materias, tareas, notas, asistencia y recompensas de tus alumnos."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/professor/attendance">
                <CalendarCheck className="h-4 w-4" />
                Abrir asistencia
              </Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link href="/professor/tasks">
                <Plus className="h-4 w-4" />
                Nueva tarea
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Alumnos"
          value={demoStudents.length * 8}
          hint="En 5 materias"
          icon={<Users className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Por revisar"
          value={pendingReviews}
          hint="Entregas pendientes"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          label="Notas subidas"
          value={demoGrades.length * 9}
          hint="Este semestre"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="ZAM otorgados"
          value="14 200"
          hint="A tus alumnos"
          icon={<Coins className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <div className="relative bg-ink-gradient p-6 text-white">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="relative flex items-center justify-between">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300">
                    <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {activeSession ? "Sesión activa" : "Sin sesión activa"}
                  </Badge>
                  <h2 className="mt-3 font-display text-xl font-bold">
                    {activeSession?.subjectName ?? "Abre una asistencia"}
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    {activeSession
                      ? `Código ${activeSession.code} · cierra ${relativeTime(activeSession.closesAt)} · ${activeSession.checkedInCount} presentes`
                      : "Genera un código QR/PIN para que tus alumnos marquen presencia."}
                  </p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient">
                  <CalendarCheck className="h-6 w-6" />
                </span>
              </div>
            </div>
          </Card>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Tus materias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoSubjects.map((s) => (
                <div key={s.id} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-1.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.code} · {s.credits} créditos · {s.enrolled} alumnos
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Activa</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Tareas aprobadas", value: 78 },
                { label: "Asistencia promedio", value: 91 },
                { label: "Créditos aprobados", value: 64 },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value}%</span>
                  </div>
                  <Progress value={m.value} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { href: "/professor/grades", label: "Subir notas", icon: FileText },
                { href: "/professor/tasks", label: "Revisar tareas", icon: ClipboardList },
                { href: "/professor/students", label: "Ver alumnos", icon: Users },
                { href: "/professor/rewards", label: "Otorgar ZAM", icon: Coins },
              ].map((a) => (
                <Button
                  key={a.href}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                >
                  <Link href={a.href}>
                    <a.icon className="h-5 w-5 text-brand" />
                    <span className="text-xs">{a.label}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
