"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import { Copy, Droplets, Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/components/session-provider";
import { studentRelay } from "@/lib/onchain/relay-client";
import { shortAddress } from "@/lib/utils";

export function ReceiveDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { session } = useSession();
  const account = useActiveAccount();
  const address =
    account?.address ??
    session?.wallet ??
    "0x0000000000000000000000000000000000000000";
  const [copied, setCopied] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Recibir</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recibir ZAMORA</DialogTitle>
          <DialogDescription>
            Comparte tu dirección para recibir ZAMORA de otros estudiantes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-4">
            <QRCodeSVG value={address} size={168} level="M" />
          </div>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(address);
                setCopied(true);
                toast.success("Dirección copiada");
                setTimeout(() => setCopied(false), 1500);
              } catch {
                toast.error("No se pudo copiar");
              }
            }}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
          >
            <span className="font-mono">{shortAddress(address, 10)}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-brand">
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copiado" : "Copiar"}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TransferDialog({
  balance,
  trigger,
}: {
  balance: number;
  trigger?: React.ReactNode;
}) {
  const account = useActiveAccount();
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      toast.error("Introduce una dirección válida (0x…).");
      return;
    }
    if (!value || value <= 0) {
      toast.error("Introduce un monto válido.");
      return;
    }
    if (value > balance) {
      toast.error("Saldo insuficiente");
      return;
    }
    if (!account) {
      toast.error("Inicia sesión con tu billetera para transferir.");
      return;
    }
    setLoading(true);
    try {
      const res = await studentRelay({
        account,
        action: "transfer",
        amount: value,
        payload: { to: recipient },
      });
      if (res.ok) {
        toast.success(`Enviaste ${value} ZAM a ${shortAddress(recipient)}`, {
          description: `Tx: ${shortAddress(res.hash, 8)}`,
        });
        setOpen(false);
        setAmount("");
        setRecipient("");
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al transferir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="gradient" className="w-full">
            <Send className="h-4 w-4" />
            Transferir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir ZAMORA</DialogTitle>
          <DialogDescription>
            Envía ZAMORA a otra billetera. Disponible:{" "}
            {balance.toLocaleString("es-ES")} ZAM.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Destinatario</Label>
            <Input
              id="recipient"
              placeholder="0x…"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (ZAM)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar transferencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FaucetDialog({ trigger }: { trigger?: React.ReactNode }) {
  const account = useActiveAccount();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFaucet = async () => {
    if (!account) {
      toast.error("Inicia sesión con tu billetera para usar el faucet.");
      return;
    }
    setLoading(true);
    try {
      const res = await studentRelay({
        account,
        action: "faucet",
        payload: { amount: 50 },
      });
      if (res.ok) {
        toast.success("Recibiste 50 ZAM de prueba", {
          description: `Tx: ${shortAddress(res.hash, 8)}`,
        });
        setOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error en el faucet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Droplets className="h-4 w-4" />
            Faucet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ZAMORA de prueba</DialogTitle>
          <DialogDescription>
            Recibe 50 ZAM gratis para probar el programa (solo red de pruebas).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="gradient" onClick={handleFaucet} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reclamar 50 ZAM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
