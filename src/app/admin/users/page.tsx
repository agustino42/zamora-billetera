"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Ban, Coins, ShieldCheck, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoStudents, demoProfessors } from "@/lib/mock-data";
import { shortAddress, formatNumber } from "@/lib/utils";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "student" | "professor";
  wallet: string;
  zamora: number;
  status: "active" | "suspended";
}

const initial: UserRow[] = [
  ...demoStudents.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: "student" as const,
    wallet: s.wallet,
    zamora: s.zamora,
    status: "active" as const,
  })),
  ...demoProfessors.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: "professor" as const,
    wallet: p.wallet,
    zamora: 0,
    status: p.active ? ("active" as const) : ("suspended" as const),
  })),
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [tab, setTab] = useState("all");

  const toggle = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u,
      ),
    );
    toast.success("Estado actualizado");
  };

  const filtered =
    tab === "all" ? users : users.filter((u) => u.role === tab);

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: "Usuario",
      primary: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{u.name.replace("Prof. ", "").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{u.name}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      render: (u) => (
        <Badge variant={u.role === "professor" ? "gold" : "outline"}>
          {u.role === "professor" ? "Profesor" : "Estudiante"}
        </Badge>
      ),
    },
    { key: "wallet", header: "Wallet", render: (u) => (
      <span className="font-mono text-xs text-muted-foreground">{shortAddress(u.wallet)}</span>
    ) },
    { key: "zamora", header: "Saldo ZAM", sortValue: (u) => u.zamora, render: (u) => formatNumber(u.zamora, 0) },
    {
      key: "status",
      header: "Estado",
      render: (u) => (
        <Badge variant={u.status === "active" ? "success" : "danger"}>
          {u.status === "active" ? "Activo" : "Suspendido"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (u) => (
        <Button size="sm" variant="outline" onClick={() => toggle(u.id)}>
          {u.status === "active" ? (
            <>
              <Ban className="h-3.5 w-3.5" /> Suspender
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" /> Activar
            </>
          )}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Gestiona estudiantes y profesores del campus."
      />

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Total" value={users.length} icon={<Users className="h-4 w-4" />} accent />
        <StatCard label="Estudiantes" value={users.filter((u) => u.role === "student").length} />
        <StatCard label="Profesores" value={users.filter((u) => u.role === "professor").length} />
        <StatCard
          label="Suspendidos"
          value={users.filter((u) => u.status === "suspended").length}
          icon={<Coins className="h-4 w-4" />}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="student">Estudiantes</TabsTrigger>
          <TabsTrigger value="professor">Profesores</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={filtered}
        searchable
        searchKeys={["name", "email"]}
      />
    </div>
  );
}
