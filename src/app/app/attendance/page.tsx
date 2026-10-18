"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  QrCode,
  XCircle,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  demoAttendanceRecords,
  demoAttendanceSessions,
  demoProfile,
} from "@/lib/mock-data";
import { studentRelay } from "@/lib/onchain/relay-client";
import { formatDate, relativeTime, shortAddress } from "@/lib/utils";

export default function AttendancePage() {
  const account = useActiveAccount();
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const active = demoAttendanceSessions.find((s) => !s.closed && new Date(s.closesAt) > new Date());

  const doCheckIn = async () => {
    if (!active) return;
    if (code.trim().toUpperCase() !== active.code) {
      toast.error("Código incorrecto", {
        description: "Pide el código vigente a tu profesor.",
      });
      return;
    }
    if (checked.includes(active.id)) {
      toast.info("Ya registraste tu asistencia en esta sesión");
      return;
    }
    if (!account) {
      toast.error("Inicia sesión con tu billetera para marcar asistencia.");
      return;
    }
    const sessionId = Number(active.id.replace(/\D/g, "")) || 0;
    if (!sessionId) {
      toast.error("Esta sesión aún no está on-chain.");
      return;
    }
    setSending(true);
    try {
      const res = await studentRelay({
        account,
        action: "attendance-checkin",
        payload: { sessionId, code: active.code },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setChecked((prev) => [...prev, active.id]);
      toast.success("Asistencia registrada · +10 ZAMORA", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
      setCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al marcar.");
    } finally {
      setSending(false);
    }
  };

  const present = demoAttendanceRecords.filter((r) => r.present).length;

  return (
    <div>
      <PageHeader
        title="Asistencia"
        description="Marca tu presencia con el código de la sesión y mantén tu racha al día."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <div className="relative bg-ink-gradient p-6 text-white">
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <Badge className="bg-emerald-500/20 text-emerald-300">
                      <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Sesión activa
                    </Badge>
                    <h2 className="mt-3 font-display text-xl font-bold">
                      {active?.subjectName}
                    </h2>
                    <p className="mt-1 text-sm text-white/60">
                      Cierra {active ? relativeTime(active.closesAt) : "—"} ·{" "}
                      {active?.checkedInCount ?? 0} compañeros registrados
                    </p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient">
                    <QrCode className="h-6 w-6" />
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Ingresa el código (ej. ZAM-4821)"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="pl-10 font-mono tracking-widest uppercase"
                    />
                  </div>
                  <Button variant="gradient" onClick={doCheckIn} disabled={sending}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CalendarCheck className="h-4 w-4" />
                    )}
                    Marcar asistencia
                  </Button>
                </div>
                {checked.includes(active?.id ?? "") && (
                  <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Presencia confirmada en esta sesión
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Historial reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoAttendanceRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl ${
                        r.present
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-red-500/15 text-red-500"
                      }`}
                    >
                      {r.present ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{r.subjectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(r.date)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={r.present ? "success" : "danger"}>
                    {r.present ? "Presente" : "Ausente"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative mx-auto grid h-40 w-40 place-items-center">
                <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#g)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(demoProfile.attendanceRate / 100) * 327} 327`}
                  />
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FF6A00" />
                      <stop offset="100%" stopColor="#F5B700" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <p className="font-display text-3xl font-black">
                    {demoProfile.attendanceRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Asistencia</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {present} de {demoAttendanceRecords.length} clases este mes.
              </p>
            </CardContent>
          </Card>

          <StatCard
            label="Racha actual"
            value="12 clases"
            hint="Mejor racha: 19"
            icon={<Clock className="h-4 w-4" />}
            accent
          />
          <StatCard
            label="ZAM ganados por asistencia"
            value="120"
            hint="+10 por cada clase"
            icon={<CalendarCheck className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}
