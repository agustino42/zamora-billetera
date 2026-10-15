"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/components/session-provider";
import { demoCourses } from "@/lib/mock-data";
import type { Course } from "@/lib/types";
import { COURSE_BURN_SHARE, COURSE_INSTRUCTOR_SHARE } from "@/lib/config";

export default function ProfessorCoursesPage() {
  const { session } = useSession();
  const [courses, setCourses] = useState<Course[]>(demoCourses);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "120",
    seats: "30",
    category: "Web3",
  });

  const earnings = 3480;
  const royalties = Math.round((earnings * COURSE_INSTRUCTOR_SHARE) / 100);

  const create = () => {
    if (!form.title) {
      toast.error("Escribe un título");
      return;
    }
    setCourses((prev) => [
      {
        id: `crs-${Date.now()}`,
        title: form.title,
        description: form.description || "Nuevo curso",
        price: Number(form.price) || 0,
        instructorId: "me",
        instructorName: session?.name ?? "Tú",
        seats: Number(form.seats) || 0,
        enrolled: 0,
        completed: 0,
        progress: 0,
        enrolledSelf: false,
        category: form.category,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ ...form, title: "", description: "" });
    toast.success("Curso creado y listado en el catálogo");
  };

  const columns: Column<Course>[] = [
    {
      key: "title",
      header: "Curso",
      primary: true,
      render: (c) => (
        <div>
          <p className="font-medium">{c.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {c.description}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Precio",
      sortValue: (c) => c.price,
      render: (c) => <span className="font-bold text-brand">{c.price} ZAM</span>,
    },
    { key: "enrolled", header: "Inscritos", render: (c) => `${c.enrolled}/${c.seats}` },
    { key: "completed", header: "Completados", render: (c) => c.completed },
    {
      key: "category",
      header: "Categoría",
      render: (c) => <Badge variant="outline">{c.category}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cursos"
        description="Publica cursos, revisa inscritos y consulta tus ingresos (split 80/20)."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Nuevo curso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear curso</DialogTitle>
                <DialogDescription>
                  El {COURSE_INSTRUCTOR_SHARE}% de cada venta es para el instructor; el{" "}
                  {COURSE_BURN_SHARE}% se quema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ctitle">Título</Label>
                  <Input
                    id="ctitle"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdesc">Descripción</Label>
                  <Textarea
                    id="cdesc"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cprice">Precio</Label>
                    <Input
                      id="cprice"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cseats">Cupos</Label>
                    <Input
                      id="cseats"
                      type="number"
                      value={form.seats}
                      onChange={(e) => setForm({ ...form, seats: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ccat">Categoría</Label>
                    <Input
                      id="ccat"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" onClick={create}>
                  Publicar curso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Cursos activos" value={courses.length} accent />
        <StatCard label="Inscritos" value={courses.reduce((a, c) => a + c.enrolled, 0)} />
        <StatCard label="Ingresos" value={`${earnings} ZAM`} hint="Bruto acumulado" />
        <StatCard label="Tus regalías" value={`${royalties} ZAM`} hint={`${COURSE_INSTRUCTOR_SHARE}% del bruto`} />
      </div>

      <DataTable columns={columns} data={courses} searchable searchKeys={["title", "category"]} />

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Split de ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-4 overflow-hidden rounded-full">
            <div
              className="bg-brand-gradient"
              style={{ width: `${COURSE_INSTRUCTOR_SHARE}%` }}
            />
            <div
              className="bg-gold"
              style={{ width: `${COURSE_BURN_SHARE}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>Instructor {COURSE_INSTRUCTOR_SHARE}%</span>
            <span>Quemado (deflación) {COURSE_BURN_SHARE}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
