"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Loader2, Send, Wallet } from "lucide-react";
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
import { shortAddress } from "@/lib/utils";

export function ReceiveDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { session } = useSession();
  const address = session?.wallet ?? "0x0000000000000000000000000000000000000000";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Dirección copiada");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary" className="flex-1">
            <Wallet className="h-4 w-4" />
            Recibir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recibir ZAMORA</DialogTitle>
          <DialogDescription>
            Comparte tu dirección o QR para recibir tokens de tus compañeros.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-4">
            <QRCodeSVG value={address} size={168} level="M" />
          </div>
          <button
            onClick={copy}
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
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!recipient || value <= 0) {
      toast.error("Completa destinatario y monto");
      return;
    }
    if (value > balance) {
      toast.error("Saldo insuficiente");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast.success(`Enviaste ${value} ZAM a ${shortAddress(recipient)}`, {
        description: "Transacción registrada (demo).",
      });
      setAmount("");
      setRecipient("");
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="gradient" className="flex-1">
            <Send className="h-4 w-4" />
            Transferir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir ZAMORA</DialogTitle>
          <DialogDescription>
            Envía tokens a otro estudiante del campus. Disponible:{" "}
            {balance.toLocaleString("es-ES")} ZAM.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Destinatario</Label>
            <Input
              id="recipient"
              placeholder="0x… o @usuario"
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
