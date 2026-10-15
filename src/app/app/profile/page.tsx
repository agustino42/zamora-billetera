"use client";

import { toast } from "sonner";
import { Copy, GraduationCap, Share2, Wallet } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/components/session-provider";
import { demoGrades, demoProfile, demoSubjects } from "@/lib/mock-data";
import { shortAddress } from "@/lib/utils";

export default function ProfilePage() {
  const { session } = useSession();
  const referral = `ZAM-${(session?.wallet ?? "0000").slice(2, 8).toUpperCase()}`;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado`);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <div>
      <PageHeader title="Perfil" description="Tu identidad, materias y credenciales on-chain." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {(session?.name ?? "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 font-display text-xl font-bold">
              {session?.name ?? demoProfile.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {session?.email ?? demoProfile.email}
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="gold">{demoProfile.tier}</Badge>
              <Badge variant="outline">Nivel {demoProfile.level}</Badge>
            </div>
            <Separator className="my-5" />
            <div className="w-full space-y-3 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Código</span>
                <span className="font-medium">{demoProfile.studentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrera</span>
                <span className="font-medium">{demoProfile.career}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asistencia</span>
                <span className="font-medium">{demoProfile.attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand" />
                Billetera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => copy(session?.wallet ?? "", "Dirección")}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3"
              >
                <span className="font-mono text-sm">
                  {shortAddress(session?.wallet, 8)}
                </span>
                <Copy className="h-4 w-4 text-brand" />
              </button>
              <button
                onClick={() => copy(referral, "Código de referido")}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3"
              >
                <span className="text-sm">
                  Referido: <span className="font-medium">{referral}</span>
                </span>
                <Share2 className="h-4 w-4 text-brand" />
              </button>
              <p className="text-xs text-muted-foreground">
                Al conectar thirdweb + In-App Wallet, esta dirección será tu
                cuenta real en Base Sepolia. Compartir tu referido te da ZAMORA
                a ti y a tu invitado.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <StatCard label="Materias" value={demoSubjects.length} icon={<GraduationCap className="h-4 w-4" />} accent />
            <StatCard label="ZAM actuales" value={demoProfile.zamora} />
            <StatCard label="Nivel" value={demoProfile.level} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Materias y créditos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoSubjects.map((s) => {
                const grade = demoGrades.find((g) => g.subjectId === s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-1.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.code} · {s.credits} créditos
                        </p>
                      </div>
                    </div>
                    {grade ? (
                      <Badge variant={grade.passed ? "success" : "danger"}>
                        {grade.score}/20 · {grade.passed ? "Aprobada" : "Desaprobada"}
                      </Badge>
                    ) : (
                      <Badge variant="muted">En curso</Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => copy(referral, "Código de referido")}>
            <Share2 className="h-4 w-4" />
            Invitar compañeros y ganar ZAMORA
          </Button>
        </div>
      </div>
    </div>
  );
}
