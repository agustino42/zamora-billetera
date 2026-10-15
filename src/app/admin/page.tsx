"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  Coins,
  Flame,
  GraduationCap,
  Plus,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import {
  DistributionChart,
  EmissionSourcesChart,
  MintBurnChart,
} from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoAdminStats, demoAwards, demoProfessors } from "@/lib/mock-data";
import { formatNumber, relativeTime } from "@/lib/utils";

export default function AdminOverviewPage() {
  const s = demoAdminStats;

  return (
    <div>
      <PageHeader
        title="Panel de administración"
        description="Controla usuarios, la economía de ZAMORA y la operación del campus."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/economy">
                <TrendingUp className="h-4 w-4" />
                Economía
              </Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link href="/admin/professors">
                <Plus className="h-4 w-4" />
                Crear profesor
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Estudiantes"
          value={formatNumber(s.totalStudents, 0)}
          hint={`${s.totalProfessors} profesores`}
          icon={<Users className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="ZAM acuñado"
          value={formatNumber(s.totalZamoraMinted, 0)}
          hint="Histórico"
          icon={<Coins className="h-4 w-4" />}
        />
        <StatCard
          label="ZAM quemado"
          value={formatNumber(s.totalZamoraBurned, 0)}
          hint="Deflación"
          icon={<Flame className="h-4 w-4" />}
        />
        <StatCard
          label="En circulación"
          value={formatNumber(s.totalCirculating, 0)}
          hint="Oferta circulante"
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Acuñación vs. quema</CardTitle>
          </CardHeader>
          <CardContent>
            <MintBurnChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de ZAMORA</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionChart />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Emisión por fuente</CardTitle>
          </CardHeader>
          <CardContent>
            <EmissionSourcesChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimas acuñaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoAwards.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.studentName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.reason}
                  </p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <p className="font-bold text-brand">+{a.amount}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {relativeTime(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <StatCard
          label="Materias"
          value={s.totalSubjects}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          label="Tareas aprobadas"
          value={formatNumber(s.tasksApproved, 0)}
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatCard
          label="Certificados SBT"
          value={formatNumber(s.certificates, 0)}
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-brand" />
            Profesores recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoProfessors.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border/60 p-4"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.email}</p>
              </div>
              <Badge variant={p.active ? "success" : "muted"}>
                {p.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
