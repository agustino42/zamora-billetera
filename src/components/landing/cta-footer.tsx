"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZamoraLogo } from "@/components/brand/logo";

export function CtaBand() {
  return (
    <section className="relative py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-6 py-14 text-center text-white sm:px-14"
        >
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Empieza a ganar ZAMORA hoy
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/85">
              Tu billetera te espera. Sin descargas, sin gas, sin complicaciones.
              Solo tu correo y ganas de crecer.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90"
                asChild
              >
                <Link href="/login">
                  Crear mi billetera
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/app">Explorar la demo</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <ZamoraLogo />
            <p className="mt-4 text-sm text-muted-foreground">
              Programa de incentivos on-chain para campus universitarios.
              Aprende, participa y gana. Construido sobre thirdweb y Base.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="font-display text-sm font-bold">Producto</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#como-funciona" className="hover:text-foreground">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#economia" className="hover:text-foreground">
                    Economía
                  </a>
                </li>
                <li>
                  <a href="#cursos" className="hover:text-foreground">
                    Cursos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-display text-sm font-bold">Acceder</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Estudiante
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login?tipo=profesor"
                    className="hover:text-foreground"
                  >
                    Profesor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login?tipo=admin"
                    className="hover:text-foreground"
                  >
                    Administrador
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-display text-sm font-bold">Red</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Base Sepolia</li>
                <li>thirdweb</li>
                <li>Supabase</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Zamora Wallet. Todos los derechos reservados.</p>
          <p>Hecho para estudiantes de Ingeniería en Informática.</p>
        </div>
      </div>
    </footer>
  );
}
