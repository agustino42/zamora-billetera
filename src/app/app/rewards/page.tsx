"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import {
  Coins,
  Gift,
  Loader2,
  ShoppingBag,
  Ticket,
  Trophy,
  Utensils,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoRewards } from "@/lib/mock-data";
import { useZamoraBalance } from "@/lib/hooks/use-zamora-balance";
import { studentRelay } from "@/lib/onchain/relay-client";
import { cn, shortAddress } from "@/lib/utils";
import type { Reward } from "@/lib/types";

const CATEGORY_ICON: Record<Reward["category"], typeof Gift> = {
  conferencia: Ticket,
  merch: Gift,
  beca: Trophy,
  cafeteria: Utensils,
  servicio: ShoppingBag,
};

function onchainId(id: string) {
  return Number(id.replace(/\D/g, "")) || 0;
}

export default function RewardsPage() {
  const account = useActiveAccount();
  const { balance } = useZamoraBalance();
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const redeem = async (r: Reward) => {
    if (r.cost > balance) {
      toast.error("Saldo insuficiente", {
        description: `Necesitas ${r.cost} ZAM y tienes ${balance.toFixed(0)}.`,
      });
      return;
    }
    if (!account) {
      toast.error("Inicia sesión con tu billetera para canjear.");
      return;
    }
    const rewardId = onchainId(r.id);
    if (!rewardId) {
      toast.error("Esta recompensa aún no está on-chain.");
      return;
    }
    setLoadingId(r.id);
    try {
      const res = await studentRelay({
        account,
        action: "rewards-redeem",
        amount: r.cost,
        payload: { rewardId },
      });
      if (res.ok) {
        setRedeemed((prev) => [...prev, r.id]);
        toast.success(`Canjeaste ${r.name}`, {
          description: `Tx: ${shortAddress(res.hash, 8)}`,
        });
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al canjear.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Recompensas"
        description="Canjea tus ZAMORA por beneficios reales del campus. Cada canje quema tokens."
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
            <Coins className="h-4 w-4 text-brand" />
            <span className="font-display font-bold">
              {balance.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-muted-foreground">ZAM</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoRewards.map((r, i) => {
          const Icon = CATEGORY_ICON[r.category];
          const isRedeemed = redeemed.includes(r.id);
          const affordable = balance >= r.cost;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex h-full flex-col">
                <div className="relative grid h-32 place-items-center rounded-t-2xl bg-gradient-to-br from-brand/20 via-card to-card">
                  <Icon className="h-10 w-10 text-brand" />
                  <Badge className="absolute right-3 top-3 capitalize">
                    {r.category}
                  </Badge>
                  {r.stock > 0 && r.redeemed >= r.stock && (
                    <Badge variant="danger" className="absolute left-3 top-3">
                      Agotado
                    </Badge>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col p-5">
                  <h3 className="font-display font-bold">{r.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {r.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-display text-xl font-black">
                      {r.cost}
                      <span className="ml-1 text-xs font-semibold text-brand">
                        ZAM
                      </span>
                    </span>
                    <Button
                      variant={affordable ? "gradient" : "outline"}
                      size="sm"
                      disabled={isRedeemed || loadingId === r.id}
                      onClick={() => redeem(r)}
                      className={cn(!affordable && "opacity-70")}
                    >
                      {loadingId === r.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      {isRedeemed ? "Canjeado" : "Canjear"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
