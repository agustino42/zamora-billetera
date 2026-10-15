"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading, RevealStagger, StaggerItem } from "./reveal";
import {
  Coins,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Trophy,
  Wallet,
  Zap,
  Gift,
} from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Reclama tu perfil",
    text: "Entra con tu correo o Google. Zamora te crea una billetera segura automáticamente. Sin instalar nada.",
  },
  {
    icon: GraduationCap,
    title: "Aprende y asiste",
    text: "Tus profesores validan tareas, notas y asistencia. Cada logro se registra on-chain.",
  },
  {
    icon: Coins,
    title: "Gana ZAMORA",
    text: "Recibes tokens por créditos aprobados, tareas entregadas y presencia en clase.",
  },
  {
    icon: Gift,
    title: "Redime recompensas",
    text: "Canjea por cursos, pases de conferencia, merch o transferidlos a tus compañeros.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Cuatro pasos para empezar"
          description="Diseñado para que cualquier estudiante lo use sin saber de blockchain. La tecnología trabaja por ti."
        />

        <div className="relative mt-16">
          <div className="absolute left-[27px] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-brand/60 via-border to-transparent md:left-1/2 md:block md:-translate-x-1/2" />
          <div className="grid gap-8 md:grid-cols-2">
            {steps.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i}
                className={i % 2 === 1 ? "md:mt-24" : ""}
              >
                <div className="group relative flex gap-5 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/40">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand/25">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-brand">
                        PASO {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-xl font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Wallet,
    title: "Billetera estudiantil",
    text: "Ve tu saldo ZAMORA, historial, transferencias entre compañeros y tus coleccionables. Estilo MetaMask, pero simple.",
  },
  {
    icon: Zap,
    title: "Asistencia con QR",
    text: "El profesor abre una sesión con código temporal y firmas tu presencia. Resultado: cero fraude, registro inmutable.",
  },
  {
    icon: Trophy,
    title: "Niveles y logros",
    text: "Sube de Bronce a Plata y Oro. Gana badges por asistencia perfecta, rachas y estar en el top del ranking.",
  },
  {
    icon: GraduationCap,
    title: "Cursos certificados",
    text: "Toma cursos del campus y de tus compañeros. Al completarlos recibes un certificado NFT verificable en tu CV.",
  },
  {
    icon: MessageSquare,
    title: "Foro social",
    text: "Comparte apuntes, retos y proyectos. Da propinas a quien aporta y destaca tu publicación quemando tokens.",
  },
  {
    icon: ShieldCheck,
    title: "Todo verificable",
    text: "Cada token ganado, recompensa y certificado queda registrado en Base con pruebas imposibles de alterar.",
  },
];

export function Features() {
  return (
    <section className="relative bg-muted/30 py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Todo en uno"
          title="Una plataforma, todo el campus"
          description="Estudiantes, profesores y administración conectados en un mismo programa de incentivos."
        />

        <RevealStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
