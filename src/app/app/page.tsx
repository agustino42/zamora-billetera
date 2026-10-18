"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  CalendarCheck,
  Coins,
  Flame,
  Gift,
  ListChecks,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber } from "@/components/student/animated-number";
import {
  FaucetDialog,
  ReceiveDialog,
  TransferDialog,
} from "@/components/student/wallet-actions";
import { useSession } from "@/components/session-provider";
import { useZamoraBalance } from "@/lib/hooks/use-zamora-balance";
import {
  demoAwards,
  demoCollectibles,
  demoProfile,
  demoTasks,
} from "@/lib/mock-data";
import { levelFromXp, relativeTime, shortAddress } from "@/lib/utils";

const sourceMeta: Record<string, { label: string; tone: string }> = {
  task: { label: "Tarea", tone: "text-emerald-500" },
  attendance: { label: "Asistencia", tone: "text-blue-500" },
  credits: { label: "Créditos", tone: "text-brand" },
  forum: { label: "Foro", tone: "text-violet-500" },
  manual: { label: "Manual", tone: "text-muted-foreground" },
};

export default function WalletPage() {
  const { session } = useSession();
  const { balance, isLive } = useZamoraBalance();
  const xp = balance;
  const level = levelFromXp(xp);
  const pendingTasks = demoTasks.filter((t) => t.status === "pending").length;

  const greeting = session?.name?.split(" ")[0] ?? "Estudiante";

  return (
    <div>
      <PageHeader
        title={`Hola, ${greeting}`}
        description="Este es tu panel de billetera ZAMORA y tu progreso del semestre."
        actions={
          <>
            <FaucetDialog />
            <ReceiveDialog />
            <TransferDialog balance={balance} />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-ink-gradient p-6 text-white lg:col-span-2"
        >
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand/30 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">
                Saldo disponible
              </p>
              <div className="mt-2 flex items-end gap-2">
                <AnimatedNumber
                  value={balance}
                  className="font-display text-5xl font-black"
                />
                <span className="mb-2 font-display text-lg font-bold text-brand">
                  ZAM
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-white/10 text-white">
                  <Trophy className="mr-1 h-3 w-3" />
                  Nivel {level.level} · {level.tier}
                </Badge>
                {!isLive && (
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    Demo
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient shadow-lg shadow-brand/30">
              <Coins className="h-6 w-6" />
            </div>
          </div>

          <div className="relative mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-white/60">
              <span>Progreso al nivel {level.level + 1}</span>
              <span>{level.progress}%</span>
            </div>
            <Progress value={level.progress} className="bg-white/10" />
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                <CalendarCheck className="h-3.5 w-3.5" /> Asistencia
              </p>
              <p className="mt-1 font-display text-xl font-bold">
                {demoProfile.attendanceRate}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                <ListChecks className="h-3.5 w-3.5" /> Tareas pendientes
              </p>
              <p className="mt-1 font-display text-xl font-bold">
                {pendingTasks}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-1">
              <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                <Award className="h-3.5 w-3.5" /> Coleccionables
              </p>
              <p className="mt-1 font-display text-xl font-bold">
                {demoCollectibles.length}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-1 lg:content-start">
          <StatCard
            label="Racha de asistencia"
            value="12 clases"
            hint="Sigue así para el badge de oro"
            icon={<Flame className="h-4 w-4" />}
            accent
          />
          <StatCard
            label="Certificados"
            value="1 emitido"
            hint="Verificables on-chain"
            icon={<Award className="h-4 w-4" />}
          />
          <div className="hidden lg:block">
            <StatCard
              label="Ranking del campus"
              value="#3"
              hint="Top 3 este semestre"
              icon={<Trophy className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Actividad reciente</CardTitle>
            <Badge variant="outline">Ledger ZAMORA</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAwards.map((a) => {
              const meta = sourceMeta[a.source] ?? sourceMeta.manual;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
                      <Coins className={`h-4 w-4 ${meta.tone}`} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{a.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {meta.label} · {relativeTime(a.createdAt)} ·{" "}
                        {shortAddress(a.txHash, 3)}
                      </p>
                    </div>
                  </div>
                  <span className="font-display text-sm font-bold text-emerald-500">
                    +{a.amount}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Tareas por reclamar</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/tasks">
                Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoTasks
              .filter((t) => t.status !== "rejected")
              .slice(0, 4)
              .map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium">{t.title}</p>
                    <span className="whitespace-nowrap text-xs font-bold text-brand">
                      +{t.reward}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.subjectName}
                  </p>
                </div>
              ))}
            <Button variant="gradient" className="w-full" asChild>
              <Link href="/app/tasks">
                <Sparkles className="h-4 w-4" />
                Reclamar recompensas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Tus coleccionables</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/achievements">
                Ver logros <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {demoCollectibles.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-muted/30 p-4 text-center"
              >
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white">
                  {c.kind === "badge" ? (
                    <Trophy className="h-5 w-5" />
                  ) : c.kind === "pass" ? (
                    <Gift className="h-5 w-5" />
                  ) : (
                    <Award className="h-5 w-5" />
                  )}
                </span>
                <p className="mt-3 line-clamp-2 text-xs font-medium">
                  {c.name}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {c.soulbound ? "SBT" : "NFT"} #{c.tokenId}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
