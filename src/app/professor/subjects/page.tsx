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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoSubjects } from "@/lib/mock-data";
import type { Subject } from "@/lib/types";
import { staffRelay } from "@/lib/onchain/relay-client";
import { shortAddress } from "@/lib/utils";

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

export default function ProfessorSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(demoSubjects);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", credits: "3" });

  const create = async () => {
    if (!form.code || !form.name) {
      toast.error("Completa código y nombre");
      return;
    }
    const code = form.code.toUpperCase();
    const credits = Number(form.credits) || 3;
    setPending(true);
    try {
      const res = await staffRelay(
        "subject-create",
        { code, name: form.name, credits, professor: PLACEHOLDER_ADDRESS },
        "professor",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setSubjects((prev) => [
        {
          id: `sub-${Date.now()}`,
          code,
          name: form.name,
          credits,
          professorId: "me",
          professorName: "Tú",
          color: "#FF6A00",
          enrolled: 0,
        },
        ...prev,
      ]);
      setOpen(false);
      setForm({ code: "", name: "", credits: "3" });
      toast.success("Materia creada on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la materia.",
      );
    } finally {
      setPending(false);
    }
  };

  const columns: Column<Subject>[] = [
    {
      key: "name",
      header: "Materia",
      primary: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full" style={{ background: s.color }} />
          <div>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "credits",
      header: "Créditos",
      sortValue: (s) => s.credits,
      render: (s) => `${s.credits}`,
    },
    { key: "enrolled", header: "Alumnos", render: (s) => s.enrolled },
    {
      key: "status",
      header: "Estado",
      render: () => <Badge variant="success">Activa</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Materias"
        description="Administra las materias que impartes y sus créditos."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Nueva materia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear materia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    placeholder="INF-306"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Compiladores"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Créditos</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" disabled={pending} onClick={create}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear materia
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={subjects} searchable searchKeys={["name", "code"]} />
    </div>
  );
}
