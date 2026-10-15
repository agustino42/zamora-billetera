"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function FloatingToken() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient shadow-2xl shadow-brand/40"
    >
      <span className="font-display text-xl font-black text-white">Z</span>
      <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-gold text-[10px] font-black text-black">
        ZAM
      </span>
    </motion.div>
  );
}

function WalletPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand/20 blur-3xl" />
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-ink-gradient p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FloatingToken />
            <div>
              <p className="text-xs text-white/50">Billetera Zamora</p>
              <p className="font-display text-sm font-semibold">
                Valeria Mendoza
              </p>
            </div>
          </div>
          <Badge className="bg-white/10 text-white">Plata</Badge>
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-wider text-white/40">
            Saldo disponible
          </p>
          <div className="mt-1 flex items-end gap-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-display text-4xl font-black tabular-nums"
            >
              1 240,50
            </motion.span>
            <span className="mb-1 font-semibold text-brand">ZAM</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Tareas", value: "3" },
            { label: "Asistencia", value: "94%" },
            { label: "Nivel", value: "7" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
            >
              <p className="font-display text-lg font-bold">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 p-3 text-xs">
          <Sparkles className="h-4 w-4 shrink-0 text-brand" />
          <span className="text-white/80">
            +80 ZAM por aprobar tu tarea de contratos
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <div className="h-9 flex-1 rounded-xl bg-brand-gradient" />
          <div className="h-9 w-9 rounded-xl border border-white/15 bg-white/5" />
          <div className="h-9 w-9 rounded-xl border border-white/15 bg-white/5" />
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 top-24 hidden rounded-2xl border border-border bg-card p-3 shadow-xl sm:block"
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-500">
            <Zap className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold">+10 ZAM</span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">Asistencia</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 bottom-16 hidden rounded-2xl border border-border bg-card p-3 shadow-xl sm:block"
      >
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <span className="font-semibold">Certificado SBT</span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">Verificado on-chain</p>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-ink-gradient pb-24 pt-28 text-white sm:pt-32"
    >
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-radial-glow" />
      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
      />
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute -right-16 top-64 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
      />

      <div className="container relative grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
              <Wallet className="h-3.5 w-3.5 text-brand" />
              Incentivos universitarios en la blockchain
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Tu esfuerzo en el campus,
            <br />
            ahora vale{" "}
            <span className="text-gradient">ZAMORA</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-base text-white/70 sm:text-lg"
          >
            Gana tokens ZAMORA por tus notas, asistencia y tareas. Aprende con
            cursos certificados on-chain, participa en el foro y redime
            recompensas reales. Todo sin complicaciones de cripto.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button variant="gradient" size="lg" asChild>
              <Link href="/login">
                Crear mi billetera gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <a href="#como-funciona">Ver cómo funciona</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/50"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Gas gratis
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Sin MetaMask
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Logros
              verificables
            </span>
          </motion.div>
        </div>

        <WalletPreview />
      </div>
    </section>
  );
}
