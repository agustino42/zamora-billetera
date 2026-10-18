"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import { keccak256, toBytes } from "viem";
import {
  CheckCircle2,
  Clock,
  FileUp,
  Loader2,
  PartyPopper,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { demoTasks } from "@/lib/mock-data";
import { studentRelay } from "@/lib/onchain/relay-client";
import type { Task, TaskStatus } from "@/lib/types";
import { formatDate, cn, shortAddress } from "@/lib/utils";

const STATUS_META: Record<
  TaskStatus,
  { label: string; variant: "muted" | "warning" | "success" | "danger"; icon: typeof Clock }
> = {
  pending: { label: "Pendiente", variant: "warning", icon: Clock },
  submitted: { label: "En revisión", variant: "muted", icon: Send },
  approved: { label: "Aprobada", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rechazada", variant: "danger", icon: XCircle },
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "submitted", label: "En revisión" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

export default function TasksPage() {
  const account = useActiveAccount();
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [filter, setFilter] = useState("all");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [proof, setProof] = useState("");
  const [comment, setComment] = useState("");
  const [claimed, setClaimed] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const openSubmit = (task: Task) => {
    setActiveTask(task);
    setProof("");
    setComment("");
    setSubmitOpen(true);
  };

  const doSubmit = async () => {
    if (!activeTask) return;
    if (!account) {
      toast.error("Inicia sesión con tu billetera para enviar.");
      return;
    }
    const taskId = Number(activeTask.id.replace(/\D/g, "")) || 0;
    if (!taskId) {
      toast.error("Esta tarea aún no está on-chain.");
      return;
    }
    setSending(true);
    try {
      const proofHash = keccak256(toBytes(`${proof}|${comment}`));
      const res = await studentRelay({
        account,
        action: "submit-task",
        payload: { taskId, proofHash },
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTask.id
              ? { ...t, status: "submitted", proofHash: shortAddress(proofHash, 8) }
              : t,
          ),
        );
        setSubmitOpen(false);
        toast.success("Entrega enviada on-chain", {
          description: `Tx: ${shortAddress(res.hash, 8)}`,
        });
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar.");
    } finally {
      setSending(false);
    }
  };

  const claim = (task: Task) => {
    setClaimed((prev) => [...prev, task.id]);
    toast.success(`¡+${task.reward} ZAMORA reclamados!`, {
      description: task.title,
      icon: <PartyPopper className="h-4 w-4" />,
    });
  };

  return (
    <div>
      <PageHeader
        title="Tareas"
        description="Envía tus entregas y reclama tus recompensas en ZAMORA al ser aprobadas."
      />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="flex-1 sm:flex-none">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-5 grid gap-4">
        {filtered.map((task, i) => {
          const meta = STATUS_META[task.status];
          const isClaimed = claimed.includes(task.id);
          const canClaim = task.status === "approved" && !isClaimed;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className={cn(
                  "overflow-hidden transition-colors",
                  canClaim && "border-brand/50 shadow-lg shadow-brand/10",
                )}
              >
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={meta.variant}>
                        <meta.icon className="mr-1 h-3 w-3" />
                        {meta.label}
                      </Badge>
                      <Badge variant="outline">{task.subjectName}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Vence {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    {task.proofHash && (
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        Prueba: {task.proofHash}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                    <div className="text-right">
                      <p className="font-display text-xl font-black text-brand">
                        +{task.reward}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        ZAMORA
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {task.status === "pending" && (
                        <Button onClick={() => openSubmit(task)}>
                          <FileUp className="h-4 w-4" />
                          Enviar prueba
                        </Button>
                      )}
                      {task.status === "submitted" && (
                        <Button variant="secondary" disabled>
                          <Clock className="h-4 w-4" />
                          En revisión
                        </Button>
                      )}
                      {canClaim && (
                        <Button
                          variant="gradient"
                          onClick={() => claim(task)}
                          className="animate-pulse-glow"
                        >
                          <Sparkles className="h-4 w-4" />
                          Reclamar
                        </Button>
                      )}
                      {isClaimed && (
                        <Button variant="secondary" disabled>
                          <CheckCircle2 className="h-4 w-4" />
                          Reclamada
                        </Button>
                      )}
                      {task.status === "rejected" && (
                        <Button variant="outline" onClick={() => openSubmit(task)}>
                          <FileUp className="h-4 w-4" />
                          Reenviar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar entrega</DialogTitle>
            <DialogDescription>{activeTask?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link">Enlace de la entrega</Label>
              <Input
                id="link"
                placeholder="https://github.com/… o drive.google.com/…"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comentario</Label>
              <Textarea
                id="comment"
                placeholder="Describe brevemente tu solución…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <p className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Al enviar, se guardará el hash de tu entrega on-chain. El profesor
              podrá aprobarla y liberar tus {activeTask?.reward} ZAMORA.
            </p>
          </div>
          <DialogFooter>
            <Button variant="gradient" onClick={doSubmit} disabled={sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
