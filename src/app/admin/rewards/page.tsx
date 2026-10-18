"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Gift, Loader2, Plus, Power } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoRewards } from "@/lib/mock-data";
import { staffRelay } from "@/lib/onchain/relay-client";
import { shortAddress } from "@/lib/utils";
import type { Reward } from "@/lib/types";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>(demoRewards);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    cost: "100",
    stock: "10",
  });

  const toggle = (id: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
    toast.success("Estado de la recompensa actualizado");
  };

  const create = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const cost = Number(form.cost);
    const stock = Number(form.stock);
    if (
      !name ||
      !description ||
      !Number.isFinite(cost) ||
      cost <= 0 ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      toast.error("Completa nombre, descripción, costo y stock");
      return;
    }
    setPending(true);
    try {
      const res = await staffRelay(
        "reward-create",
        { name, description, cost, stock },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setRewards((prev) => [
        {
          id: `rw-${Date.now()}`,
          name,
          description,
          cost,
          stock,
          redeemed: 0,
          category: "merch",
          active: true,
        },
        ...prev,
      ]);
      setOpen(false);
      setForm({ name: "", description: "", cost: "100", stock: "10" });
      toast.success("Recompensa creada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la recompensa.",
      );
    } finally {
      setPending(false);
    }
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
      <PageHeader
        title="Recompensas"
        description="Administra el catálogo global de recompensas canjeables."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Nueva recompensa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear recompensa</DialogTitle>
                <DialogDescription>
                  Se registra on-chain en el catálogo global de recompensas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rname">Nombre</Label>
                  <Input
                    id="rname"
                    placeholder="Pase Conferencia Web3 Summit"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdesc">Descripción</Label>
                  <Input
                    id="rdesc"
                    placeholder="Acceso completo a la conferencia anual."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="rcost">Costo (ZAM)</Label>
                    <Input
                      id="rcost"
                      type="number"
                      min={1}
                      value={form.cost}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rstock">Stock</Label>
                    <Input
                      id="rstock"
                      type="number"
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" disabled={pending} onClick={create}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gift className="h-4 w-4" />
                  )}{" "}
                  Crear recompensa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
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
