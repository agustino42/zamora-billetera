"use client";

import Link from "next/link";
import { Reveal, RevealStagger, StaggerItem, SectionHeading } from "./reveal";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  Table2,
  UserCog,
} from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    name: "Estudiante",
    tag: "Tu billetera",
    color: "from-brand to-gold",
    perks: [
      "Billetera ZAMORA y transferencias",
      "Tareas con botón de reclamar",
      "Asistencia por QR y niveles",
      "Foro, cursos y certificados",
    ],
    cta: { href: "/login", label: "Entrar como estudiante" },
  },
  {
    icon: UserCog,
    name: "Profesor",
    tag: "Tu cátedra",
    color: "from-emerald-500 to-teal-500",
    perks: [
      "Crear tareas, exámenes y notas",
      "Abrir asistencia y validar",
      "Otorgar ZAMORA por créditos",
      "Ver el progreso de tus alumnos",
    ],
    cta: { href: "/login?tipo=profesor", label: "Entrar como profesor" },
  },
  {
    icon: ShieldCheck,
    name: "Administrador",
    tag: "Control total",
    color: "from-violet-500 to-fuchsia-500",
    perks: [
      "Crear cuentas de profesor",
      "Tablas y auditoría completa",
      "Economía, canjes y moderación",
      "Configurar el token y roles",
    ],
    cta: { href: "/login?tipo=admin", label: "Entrar como admin" },
  },
];

export function Roles() {
  return (
    <section id="roles" className="relative bg-muted/30 py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Tres roles"
          title="Cada quien con su panel"
          description="Experiencias diseñadas a la medida: billetera para estudiantes, cátedra para profesores y control total para la administración."
        />

        <RevealStagger className="mt-14 grid gap-6 lg:grid-cols-3">
          {roles.map((role) => (
            <StaggerItem key={role.name}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-7">
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${role.color}`}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${role.color} text-white shadow-lg`}
                  >
                    <role.icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {role.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold">
                  {role.name}
                </h3>
                <ul className="mt-5 flex-1 space-y-3">
                  {role.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="text-muted-foreground">{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-7 w-full" asChild>
                  <Link href={role.cta.href}>
                    {role.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </StaggerItem>
          ))}
        </RevealStagger>

        <Reveal className="mt-10">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-bold">
                  Dashboards con datos en vivo
                </p>
                <p className="text-sm text-muted-foreground">
                  Tablas, filtros, exportación y auditoría de cada movimiento.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Table2 className="h-4 w-4 text-brand" />
              Reportes listos para dirección
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
