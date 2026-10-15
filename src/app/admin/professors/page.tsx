"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, Plus, UserCog } from "lucide-react";
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
import { demoProfessors } from "@/lib/mock-data";

interface Professor {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  active: boolean;
  wallet: string;
}

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export default function AdminProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>(demoProfessors);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [created, setCreated] = useState<{ email: string; password: string } | null>(
    null,
  );

  const create = () => {
    if (!form.name || !form.email) {
      toast.error("Completa nombre y correo");
      return;
    }
    const password = genPassword();
    setProfessors((prev) => [
      {
        id: `pro-${Date.now()}`,
        name: form.name.startsWith("Prof") ? form.name : `Prof. ${form.name}`,
        email: form.email,
        subjects: [],
        active: true,
        wallet: "0x" + Math.random().toString(16).slice(2, 10) + "…",
      },
      ...prev,
    ]);
    setCreated({ email: form.email, password });
    setForm({ name: "", email: "" });
    toast.success("Cuenta de profesor creada en Supabase");
  };

  const copyCreds = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(
      `Acceso Zamora\nCorreo: ${created.email}\nContraseña: ${created.password}\nIngresa en /login → Profesor`,
    );
    toast.success("Credenciales copiadas");
  };

  const columns: Column<Professor>[] = [
    {
      key: "name",
      header: "Profesor",
      primary: true,
      render: (p) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.email}</p>
        </div>
      ),
    },
    {
      key: "subjects",
      header: "Materias",
      render: (p) =>
        p.subjects.length ? (
          <div className="flex flex-wrap gap-1">
            {p.subjects.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Sin asignar</span>
        ),
    },
    {
      key: "wallet",
      header: "Wallet",
      render: (p) => (
        <span className="font-mono text-xs text-muted-foreground">{p.wallet}</span>
      ),
    },
    {
      key: "active",
      header: "Estado",
      render: (p) => (
        <Badge variant={p.active ? "success" : "muted"}>
          {p.active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Profesores"
        description="Crea cuentas de profesor, entrega credenciales y asigna materias."
        actions={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setCreated(null);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Nuevo profesor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear cuenta de profesor</DialogTitle>
                <DialogDescription>
                  Se crea en Supabase (auth por correo). Entrega estas credenciales
                  al docente.
                </DialogDescription>
              </DialogHeader>

              {created ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-brand/40 bg-brand/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Credenciales generadas
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground">Correo:</span>{" "}
                      <span className="font-medium">{created.email}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Contraseña:</span>{" "}
                      <span className="font-mono font-medium">
                        {created.password}
                      </span>
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={copyCreds}>
                    <Copy className="h-4 w-4" /> Copiar credenciales
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pname">Nombre completo</Label>
                    <Input
                      id="pname"
                      placeholder="Ana Silva"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pemail">Correo institucional</Label>
                    <Input
                      id="pemail"
                      type="email"
                      placeholder="ana.silva@campus.edu"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                {created ? (
                  <Button variant="gradient" onClick={() => setOpen(false)}>
                    Listo
                  </Button>
                ) : (
                  <Button variant="gradient" onClick={create}>
                    <KeyRound className="h-4 w-4" /> Generar credenciales
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Profesores"
          value={professors.length}
          icon={<UserCog className="h-4 w-4" />}
          accent
        />
        <StatCard label="Activos" value={professors.filter((p) => p.active).length} />
        <StatCard
          label="Con materias"
          value={professors.filter((p) => p.subjects.length).length}
        />
        <StatCard
          label="Sin asignar"
          value={professors.filter((p) => !p.subjects.length).length}
        />
      </div>

      <DataTable
        columns={columns}
        data={professors}
        searchable
        searchKeys={["name", "email"]}
      />
    </div>
  );
}
