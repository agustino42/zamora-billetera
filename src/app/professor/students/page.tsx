"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Coins, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoStudents } from "@/lib/mock-data";
import type { Profile } from "@/lib/types";
import { staffRelay } from "@/lib/onchain/relay-client";
import { shortAddress } from "@/lib/utils";

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

export default function ProfessorStudentsPage() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [target, setTarget] = useState<Profile | null>(null);
  const [amount, setAmount] = useState("20");
  const [reason, setReason] = useState("Participación destacada");

  const award = async () => {
    if (!target) return;
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Cantidad inválida");
      return;
    }
    const studentAddress =
      target.wallet.startsWith("0x") && target.wallet.length === 42
        ? target.wallet
        : PLACEHOLDER_ADDRESS;
    setPending(true);
    try {
      const res = await staffRelay(
        "award",
        { student: studentAddress, amount: amountNum, reason: reason || "premio" },
        "professor",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      toast.success(`Otorgaste ${amount} ZAMORA a ${target.name}`, {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al otorgar ZAMORA.",
      );
    } finally {
      setPending(false);
    }
  };

  const columns: Column<Profile>[] = [
    {
      key: "name",
      header: "Alumno",
      primary: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.studentCode}</p>
          </div>
        </div>
      ),
    },
    { key: "email", header: "Correo", render: (s) => s.email },
    {
      key: "zamora",
      header: "Saldo ZAM",
      sortValue: (s) => s.zamora,
      render: (s) => <span className="font-bold">{s.zamora}</span>,
    },
    {
      key: "attendance",
      header: "Asistencia",
      sortValue: (s) => s.attendanceRate,
      render: (s) => `${s.attendanceRate}%`,
    },
    {
      key: "tier",
      header: "Nivel",
      render: (s) => (
        <Badge variant={s.tier === "Oro" ? "gold" : "outline"}>
          {s.tier}
        </Badge>
      ),
    },
    {
      key: "wallet",
      header: "Wallet",
      render: (s) => (
        <span className="font-mono text-xs text-muted-foreground">
          {shortAddress(s.wallet)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (s) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setTarget(s);
            setOpen(true);
          }}
        >
          <Coins className="h-3.5 w-3.5" /> Otorgar ZAM
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Alumnos"
        description="Consulta el progreso de tus alumnos y otórgales ZAMORA por méritos."
      />

      <DataTable
        columns={columns}
        data={demoStudents}
        searchable
        searchKeys={["name", "email", "studentCode"]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Otorgar ZAMORA</DialogTitle>
            <DialogDescription>{target?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad (ZAM)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="gradient" disabled={pending} onClick={award}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Coins className="h-4 w-4" />
              )}{" "}
              Acuñar recompensa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
