"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Coins, Flame, Loader2, Snowflake, TrendingUp } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import {
  DistributionChart,
  EmissionSourcesChart,
  MintBurnChart,
} from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { demoAdminStats, demoStudents } from "@/lib/mock-data";
import {
  COURSE_BURN_SHARE,
  COURSE_INSTRUCTOR_SHARE,
  FORUM_TOLL,
  TEACHING_MULTIPLIER,
} from "@/lib/config";
import { staffRelay } from "@/lib/onchain/relay-client";
import { formatNumber, shortAddress } from "@/lib/utils";

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

export default function AdminEconomyPage() {
  const s = demoAdminStats;
  const [mintAmount, setMintAmount] = useState("1000");
  const [burnAmount, setBurnAmount] = useState("1000");
  const [mintTo, setMintTo] = useState(demoStudents[0].wallet);
  const [burnFrom, setBurnFrom] = useState(demoStudents[0].wallet);
  const [paused, setPaused] = useState(false);
  const [pendingMint, setPendingMint] = useState(false);
  const [pendingBurn, setPendingBurn] = useState(false);

  const mint = async () => {
    const amount = Number(mintAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Importe de acuñación inválido");
      return;
    }
    const to =
      mintTo.startsWith("0x") && mintTo.length === 42
        ? mintTo
        : PLACEHOLDER_ADDRESS;
    setPendingMint(true);
    try {
      const res = await staffRelay(
        "treasury-mint",
        { to, amount, reason: "Acuñación manual desde el panel admin" },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success(`Acuñados ${amount} ZAM`, {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al acuñar ZAM.",
      );
    } finally {
      setPendingMint(false);
    }
  };

  const burn = async () => {
    const amount = Number(burnAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Importe de quema inválido");
      return;
    }
    const from =
      burnFrom.startsWith("0x") && burnFrom.length === 42
        ? burnFrom
        : PLACEHOLDER_ADDRESS;
    setPendingBurn(true);
    try {
      const res = await staffRelay(
        "treasury-burn",
        { from, amount, reason: "Quema manual desde el panel admin" },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success(`Quemados ${amount} ZAM`, {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al quemar ZAM.",
      );
    } finally {
      setPendingBurn(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Economía ZAMORA"
        description="Supervisa la acuñación, la quema y los parámetros del token ZAM en Base Sepolia."
        actions={
          <Button
            variant={paused ? "gradient" : "outline"}
            onClick={() => {
              setPaused((p) => !p);
              toast[paused ? "success" : "warning"](
                paused ? "Emisión reanudada" : "Emisión pausada",
              );
            }}
          >
            <Snowflake className="h-4 w-4" />
            {paused ? "Reanudar emisión" : "Pausar emisión"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Total acuñado"
          value={formatNumber(s.totalZamoraMinted, 0)}
          icon={<Coins className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Total quemado"
          value={formatNumber(s.totalZamoraBurned, 0)}
          icon={<Flame className="h-4 w-4" />}
        />
        <StatCard
          label="En circulación"
          value={formatNumber(s.totalCirculating, 0)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Ratio quema/emisión"
          value={`${Math.round((s.totalZamoraBurned / s.totalZamoraMinted) * 100)}%`}
          hint="Índice deflacionario"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Acuñación vs. quema (7 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <MintBurnChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución</CardTitle>
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
            <CardTitle>Acciones de tesorería</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="mintTo">Destino (wallet)</Label>
              <Input
                id="mintTo"
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mint">Acuñar ZAM</Label>
              <div className="flex gap-2">
                <Input
                  id="mint"
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                />
                <Button
                  variant="gradient"
                  disabled={pendingMint}
                  onClick={mint}
                >
                  {pendingMint ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Coins className="h-4 w-4" />
                  )}{" "}
                  Acuñar
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="burnFrom">Origen (wallet)</Label>
              <Input
                id="burnFrom"
                value={burnFrom}
                onChange={(e) => setBurnFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="burn">Quemar ZAM</Label>
              <div className="flex gap-2">
                <Input
                  id="burn"
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={pendingBurn}
                  onClick={burn}
                >
                  {pendingBurn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flame className="h-4 w-4" />
                  )}{" "}
                  Quemar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Parámetros de la economía</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">Crédito aprobado</p>
            <p className="mt-1 font-display text-xl font-bold text-brand">
              {TEACHING_MULTIPLIER.credit} ZAM
            </p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">Asistencia</p>
            <p className="mt-1 font-display text-xl font-bold text-brand">
              {TEACHING_MULTIPLIER.attendance} ZAM
            </p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">Peaje de foro</p>
            <p className="mt-1 font-display text-xl font-bold text-brand">
              {FORUM_TOLL} ZAM
            </p>
            <Badge variant="muted" className="mt-1">
              Devolvible con 5 upvotes
            </Badge>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">Split de cursos</p>
            <p className="mt-1 font-display text-xl font-bold text-brand">
              {COURSE_INSTRUCTOR_SHARE}/{COURSE_BURN_SHARE}
            </p>
            <Badge variant="gold" className="mt-1">
              {COURSE_BURN_SHARE}% quemado
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
