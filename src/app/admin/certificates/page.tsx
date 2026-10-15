"use client";

import { toast } from "sonner";
import { Award, ExternalLink } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoCertificates } from "@/lib/mock-data";
import type { Certificate } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminCertificatesPage() {
  const columns: Column<Certificate>[] = [
    {
      key: "course",
      header: "Certificado",
      primary: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/15 text-gold">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium">{c.courseTitle}</p>
            <p className="text-xs text-muted-foreground">{c.studentName}</p>
          </div>
        </div>
      ),
    },
    { key: "student", header: "Alumno", render: (c) => c.studentName, hideOnMobile: true },
    {
      key: "soulbound",
      header: "Tipo",
      render: () => <Badge variant="gold">SBT · No transferible</Badge>,
    },
    { key: "date", header: "Emitido", sortValue: (c) => c.issuedAt, render: (c) => formatDate(c.issuedAt) },
    {
      key: "tx",
      header: "Transacción",
      render: (c) => (
        <span className="font-mono text-xs text-muted-foreground">{c.txHash}</span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (c) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info(`Ver en explorer: ${c.txHash}`)}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Ver
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Certificados"
        description="Certificados de curso emitidos como Soulbound Tokens (no transferibles)."
      />

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Emitidos"
          value={demoCertificates.length}
          icon={<Award className="h-4 w-4" />}
          accent
        />
        <StatCard label="Este mes" value={42} />
        <StatCard label="Verificados" value={demoCertificates.length} />
        <StatCard label="Tipo" value="SBT" hint="Soulbound" />
      </div>

      <DataTable
        columns={columns}
        data={demoCertificates}
        emptyMessage="Aún no hay certificados emitidos"
      />
    </div>
  );
}
