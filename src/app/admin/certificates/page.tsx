"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Award, ExternalLink, Loader2, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoCertificates, demoCourses, demoStudents } from "@/lib/mock-data";
import type { Certificate } from "@/lib/types";
import { onchainId, staffRelay } from "@/lib/onchain/relay-client";
import { formatDate, shortAddress } from "@/lib/utils";

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>(
    demoCertificates,
  );
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    studentId: demoStudents[0].id,
    courseId: demoCourses[0].id,
    uri: "ipfs://cert-blockchain",
  });

  const issue = async () => {
    const student = demoStudents.find((s) => s.id === form.studentId);
    const course = demoCourses.find((c) => c.id === form.courseId);
    if (!student || !course) {
      toast.error("Selecciona alumno y curso");
      return;
    }
    const uri = form.uri.trim();
    if (!uri) {
      toast.error("Falta la URI del certificado");
      return;
    }
    const refId = onchainId(course.id);
    if (!refId) {
      toast.error("Aún no está on-chain");
      return;
    }
    const to =
      student.wallet.startsWith("0x") && student.wallet.length === 42
        ? student.wallet
        : PLACEHOLDER_ADDRESS;
    setPending(true);
    try {
      const res = await staffRelay(
        "certificate-mint",
        { to, refId, uri },
        "admin",
      );
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      setCertificates((prev) => [
        {
          id: `cert-${Date.now()}`,
          courseId: course.id,
          courseTitle: course.title,
          studentId: student.id,
          studentName: student.name,
          issuedAt: new Date().toISOString(),
          txHash: res.hash,
          soulbound: true,
        },
        ...prev,
      ]);
      setOpen(false);
      toast.success("Certificado emitido on-chain", {
        description: `Tx: ${shortAddress(res.hash, 8)}`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al emitir el certificado.",
      );
    } finally {
      setPending(false);
    }
  };

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
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Emitir certificado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Emitir certificado</DialogTitle>
                <DialogDescription>
                  Se acuña un SBT de certificado on-chain para el alumno.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Alumno</Label>
                  <Select
                    value={form.studentId}
                    onValueChange={(v) => setForm({ ...form, studentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {demoStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Curso</Label>
                  <Select
                    value={form.courseId}
                    onValueChange={(v) => setForm({ ...form, courseId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {demoCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certuri">URI del certificado</Label>
                  <Input
                    id="certuri"
                    value={form.uri}
                    onChange={(e) => setForm({ ...form, uri: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" disabled={pending} onClick={issue}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Award className="h-4 w-4" />
                  )}{" "}
                  Emitir on-chain
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard
          label="Emitidos"
          value={certificates.length}
          icon={<Award className="h-4 w-4" />}
          accent
        />
        <StatCard label="Este mes" value={42} />
        <StatCard label="Verificados" value={certificates.length} />
        <StatCard label="Tipo" value="SBT" hint="Soulbound" />
      </div>

      <DataTable
        columns={columns}
        data={certificates}
        emptyMessage="Aún no hay certificados emitidos"
      />
    </div>
  );
}
