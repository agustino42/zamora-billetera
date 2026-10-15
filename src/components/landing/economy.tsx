"use client";

import { Reveal, SectionHeading, RevealStagger, StaggerItem } from "./reveal";
import { ArrowDown, ArrowUp, Flame, Repeat } from "lucide-react";

const earn = [
  { label: "Créditos aprobados", value: "+100 ZAM por crédito" },
  { label: "Tareas validadas", value: "+25 a +80 ZAM" },
  { label: "Asistencia verificada", value: "+10 ZAM por clase" },
  { label: "Aporte en el foro", value: "+2 a +10 ZAM" },
  { label: "Referidos y rachas", value: "bonos variables" },
];

const spend = [
  { label: "Cursos certificados", value: "80% instructor / 20% quemado" },
  { label: "Pases de conferencia", value: "NFT coleccionable" },
  { label: "Peaje del foro", value: "devolvible por upvotes" },
  { label: "Tutorías entre alumnos", value: "transferencia social" },
  { label: "Boost de publicación", value: "se quema" },
];

export function Economy() {
  return (
    <section id="economia" className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Economía ZAMORA"
          title="Gana por lo que haces, gasta en lo que importa"
          description="Un token con utilidad real: premia el esfuerzo académico y circula dentro de la comunidad."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <ArrowUp className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold">
                  Cómo ganas ZAMORA
                </h3>
              </div>
              <ul className="mt-6 space-y-3">
                {earn.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/40 px-4 py-3"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-right text-xs font-semibold text-emerald-500">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="h-full rounded-2xl border border-brand/20 bg-brand/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand">
                  <ArrowDown className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-bold">
                  Cómo usas ZAMORA
                </h3>
              </div>
              <ul className="mt-6 space-y-3">
                {spend.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/40 px-4 py-3"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-right text-xs font-semibold text-brand">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <RevealStagger className="mt-6 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: Flame,
              title: "Deflación social",
              text: "Las comisiones de cursos, boosts y gobernanza se queman: menos suministro, más valor para quien participa.",
            },
            {
              icon: Repeat,
              title: "Circulación real",
              text: "Tips y tutorías transfieren tokens entre estudiantes, creando una economía peer-to-peer dentro del campus.",
            },
            {
              icon: ArrowUp,
              title: "Recompensa al mérito",
              text: "Todo lo que acuñamos tiene una razón auditada on-chain: notas, asistencia, tareas o comunidad.",
            },
          ].map((c) => (
            <StaggerItem key={c.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <c.icon className="h-6 w-6 text-brand" />
                <h4 className="mt-3 font-display font-bold">{c.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
              </div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
