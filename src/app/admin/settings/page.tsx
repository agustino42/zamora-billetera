"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  Globe,
  KeyRound,
  Save,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CONTRACTS } from "@/lib/config";
import { shortAddress } from "@/lib/utils";

const contractEntries = [
  { key: "ZamoraToken", envKey: "NEXT_PUBLIC_ZAMORA_TOKEN_ADDRESS", address: CONTRACTS.token },
  { key: "ZamoraCampus", envKey: "NEXT_PUBLIC_ZAMORA_CAMPUS_ADDRESS", address: CONTRACTS.campus },
  { key: "ZamoraRewards", envKey: "NEXT_PUBLIC_ZAMORA_REWARDS_ADDRESS", address: CONTRACTS.rewards },
  { key: "ZamoraCollectibles", envKey: "NEXT_PUBLIC_ZAMORA_COLLECTIBLES_ADDRESS", address: CONTRACTS.collectibles },
  { key: "ZamoraCourses", envKey: "NEXT_PUBLIC_ZAMORA_COURSES_ADDRESS", address: CONTRACTS.courses },
  { key: "ZamoraForum", envKey: "NEXT_PUBLIC_ZAMORA_FORUM_ADDRESS", address: CONTRACTS.forum },
];

export default function AdminSettingsPage() {
  const [referral, setReferral] = useState("25");
  const [minAttendance, setMinAttendance] = useState("75");
  const [toggles, setToggles] = useState({
    forum: true,
    courses: true,
    forumToll: true,
    manualMint: false,
  });

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
      <PageHeader
        title="Configuración"
        description="Contratos, red, permisos y parámetros operativos del programa."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand" />
              Red y contratos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Base Sepolia Testnet</p>
                <p className="text-xs text-muted-foreground">Chain ID 84532</p>
              </div>
              <Badge variant="success">Conectada</Badge>
            </div>
            <div className="space-y-2">
              {contractEntries.map((c) => (
                <button
                  key={c.key}
                  onClick={() =>
                    copy(c.address || c.envKey, c.address ? c.key : c.envKey)
                  }
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.key}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {c.address ? shortAddress(c.address, 10) : "No configurado"}
                    </p>
                  </div>
                  {c.address ? (
                    <Copy className="h-4 w-4 shrink-0 text-brand" />
                  ) : (
                    <Badge variant="warning">Pendiente</Badge>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Configura estas direcciones en <code>.env.local</code> tras
              ejecutar <code>npm run deploy</code> dentro de <code>/contracts</code>.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-brand" />
                Roles y permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { role: "DEFAULT_ADMIN_ROLE", desc: "Administra roles y parámetros", who: "System wallet" },
                { role: "MINTER_ROLE", desc: "Puede acuñar ZAM", who: "Campus · Rewards · System" },
                { role: "BURNER_ROLE", desc: "Puede quemar ZAM", who: "Courses · Forum · System" },
                { role: "PAUSER_ROLE", desc: "Pausa transferencias", who: "System wallet" },
              ].map((r) => (
                <div
                  key={r.role}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs font-semibold">{r.role}</p>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
                  <p className="mt-1 text-xs font-medium">{r.who}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand" />
                System wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <span className="font-mono text-xs">
                  {process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
                    ? "0x…… (configurada)"
                    : "No configurada"}
                </span>
                <Badge variant="outline" className="ml-auto">
                  Server-side
                </Badge>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Firma las transacciones de acuñación/quema con{" "}
                <code>SYSTEM_WALLET_PRIVATE_KEY</code>. Nunca se expone al
                cliente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Parámetros operativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="referral">Bonus por referido (ZAM)</Label>
              <Input
                id="referral"
                type="number"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance">Asistencia mínima (%)</Label>
              <Input
                id="attendance"
                type="number"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {[
              { key: "forum", label: "Foro habilitado", desc: "Permite publicar y votar" },
              { key: "courses", label: "Cursos habilitados", desc: "Mercado de cursos con split" },
              { key: "forumToll", label: "Peaje de foro", desc: "Cobra 5 ZAM reembolsable por publicación" },
              { key: "manualMint", label: "Acuñación manual", desc: "Permite a profesores acuñar libremente" },
            ].map((t) => {
              const active = toggles[t.key as keyof typeof toggles];
              return (
                <div
                  key={t.key}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setToggles((prev) => ({
                        ...prev,
                        [t.key]: !active,
                      }))
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      active ? "bg-brand" : "bg-muted"
                    }`}
                    aria-label={t.label}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        active ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <Button
            variant="gradient"
            className="w-full"
            onClick={() =>
              toast.success("Configuración guardada", {
                description: "Se aplicará en el próximo despliegue.",
              })
            }
          >
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-brand" />
            Enlaces útiles
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noreferrer"
            >
              BaseScan Sepolia
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://thirdweb.com/dashboard" target="_blank" rel="noreferrer">
              thirdweb Dashboard
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
              Supabase
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
