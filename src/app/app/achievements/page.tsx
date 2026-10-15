"use client";

import { motion } from "framer-motion";
import { Award, Lock, Medal, Trophy, Zap } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { demoCollectibles, demoLeaderboard, demoProfile } from "@/lib/mock-data";
import { levelFromXp } from "@/lib/utils";

const ALL_BADGES = [
  { id: "b1", name: "Asistencia Perfecta", desc: "100% de asistencia un mes", earned: true },
  { id: "b2", name: "Top 3 del Ranking", desc: "Entre los 3 mejores del campus", earned: true },
  { id: "b3", name: "Racha de 20", desc: "20 clases seguidas", earned: false },
  { id: "b4", name: "Tutor del mes", desc: "Ayuda a 5 compañeros", earned: false },
  { id: "b5", name: "Primer certificado", desc: "Completa tu primer curso", earned: true },
  { id: "b6", name: "Constructor Web3", desc: "Despliega un contrato", earned: true },
];

export default function AchievementsPage() {
  const level = levelFromXp(demoProfile.zamora);

  return (
    <div>
      <PageHeader
        title="Logros y reputación"
        description="Sube de nivel, colecciona insignias soulbound y compite en el ranking."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient font-display text-2xl font-black text-white shadow-lg shadow-brand/30">
                {level.level}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold">
                    Nivel {level.level}
                  </h2>
                  <Badge variant="gold">{level.tier}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {level.nextFloor - Math.round(demoProfile.zamora)} ZAM para el
                  siguiente nivel
                </p>
                <Progress value={level.progress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-5 lg:grid-cols-1">
          <StatCard label="Insignias" value="4" icon={<Medal className="h-4 w-4" />} accent />
          <StatCard label="Certificados" value="1" icon={<Award className="h-4 w-4" />} />
          <StatCard label="ZAM totales" value={demoProfile.zamora} icon={<Zap className="h-4 w-4" />} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Insignias</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ALL_BADGES.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border p-4 text-center ${
                  b.earned
                    ? "border-brand/30 bg-brand/[0.04]"
                    : "border-dashed border-border opacity-60"
                }`}
              >
                <span
                  className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${
                    b.earned
                      ? "bg-brand-gradient text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {b.earned ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </span>
                <p className="mt-3 text-sm font-semibold">{b.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoLeaderboard.map((e) => (
              <div
                key={e.studentId}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  e.studentId === "stu-001"
                    ? "bg-brand/10 ring-1 ring-brand/30"
                    : ""
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                    e.rank === 1
                      ? "bg-gold text-black"
                      : e.rank <= 3
                        ? "bg-brand/15 text-brand"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {e.rank}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {e.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.attendance}% asistencia
                  </p>
                </div>
                <span className="text-sm font-bold">
                  {e.zamora.toLocaleString("es-ES")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Coleccionables</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {demoCollectibles.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-muted/30 p-4 text-center"
              >
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white">
                  <Award className="h-5 w-5" />
                </span>
                <p className="mt-3 line-clamp-2 text-xs font-medium">{c.name}</p>
                <Badge variant={c.soulbound ? "outline" : "default"} className="mt-2">
                  {c.soulbound ? "SBT" : "NFT"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
