"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoRewards } from "@/lib/mock-data";
import type { Reward } from "@/lib/types";
import { staffRelay } from "@/lib/onchain/relay-client";
import { shortAddress } from "@/lib/utils";

export default function ProfessorRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>(demoRewards);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    cost: "50",
    stock: "20",
  });

  const create = async () => {
    if (!form.name) {
      toast.error("Escribe un nombre");
      return;
    }
    const name = form.name;
    const description = form.description || "Recompensa del curso";
    const cost = Number(form.cost) || 0;
    const stock = Number(form.stock) || 0;
    setPending(true);
    try {
      const res = await staffRelay(
        "reward-create",
        { name, description, cost, stock },
        "professor",
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
          category: "servicio",
          active: true,
        },
        ...prev,
      ]);
      setOpen(false);
      setForm({ name: "", description: "", cost: "50", stock: "20" });
      toast.success("Recompensa publicada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear la recompensa.",
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
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {r.description}
          </p>
        </div>
      ),
    },
    {
      key: "cost",
      header: "Costo",
      sortValue: (r) => r.cost,
      render: (r) => <span className="font-bold text-brand">{r.cost} ZAM</span>,
    },
    { key: "stock", header: "Stock", render: (r) => `${r.stock - r.redeemed} disponibles` },
    {
      key: "category",
      header: "Categoría",
      render: (r) => <Badge variant="outline">{r.category}</Badge>,
    },
    {
      key: "active",
      header: "Estado",
      render: (r) => (
        <Badge variant={r.active ? "success" : "muted"}>
          {r.active ? "Activa" : "Pausada"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Recompensas del curso"
        description="Crea recompensas que tus alumnos pueden canjear con ZAMORA."
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
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rname">Nombre</Label>
                  <Input
                    id="rname"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rdesc">Descripción</Label>
                  <Textarea
                    id="rdesc"
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
                      value={form.cost}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rstock">Stock</Label>
                    <Input
                      id="rstock"
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" disabled={pending} onClick={create}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={rewards} searchable searchKeys={["name"]} />
    </div>
  );
}
