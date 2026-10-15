"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Gift, Power } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoRewards } from "@/lib/mock-data";
import type { Reward } from "@/lib/types";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>(demoRewards);

  const toggle = (id: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
    toast.success("Estado de la recompensa actualizado");
  };

  const columns: Column<Reward>[] = [
    {
      key: "name",
      header: "Recompensa",
      primary: true,
      render: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
        </div>
      ),
    },
    { key: "cost", header: "Costo", sortValue: (r) => r.cost, render: (r) => <span className="font-bold text-brand">{r.cost} ZAM</span> },
    { key: "stock", header: "Stock", render: (r) => `${r.stock - r.redeemed}/${r.stock}` },
    { key: "redeemed", header: "Canjeados", sortValue: (r) => r.redeemed, render: (r) => r.redeemed },
    { key: "category", header: "Categoría", render: (r) => <Badge variant="outline">{r.category}</Badge> },
    {
      key: "active",
      header: "Estado",
      render: (r) => (
        <Badge variant={r.active ? "success" : "muted"}>{r.active ? "Activa" : "Pausada"}</Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => toggle(r.id)}>
          <Power className="h-3.5 w-3.5" /> {r.active ? "Pausar" : "Activar"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Recompensas" description="Administra el catálogo global de recompensas canjeables." />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Recompensas" value={rewards.length} icon={<Gift className="h-4 w-4" />} accent />
        <StatCard label="Activas" value={rewards.filter((r) => r.active).length} />
        <StatCard label="Canjes totales" value={rewards.reduce((a, r) => a + r.redeemed, 0)} />
        <StatCard label="ZAM gastados" value={rewards.reduce((a, r) => a + r.redeemed * r.cost, 0)} />
      </div>
      <DataTable columns={columns} data={rewards} searchable searchKeys={["name"]} />
    </div>
  );
}
