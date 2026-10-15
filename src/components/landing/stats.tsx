"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal } from "./reveal";
import { Coins, GraduationCap, ShieldCheck, Users } from "lucide-react";

function Counter({
  to,
  suffix = "",
  prefix = "",
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString("es-ES")}
      {suffix}
    </span>
  );
}

const stats = [
  { icon: Users, value: 1240, suffix: "+", label: "Estudiantes activos" },
  { icon: GraduationCap, value: 96, suffix: "", label: "Materias conectadas" },
  { icon: Coins, value: 486000, suffix: "+", label: "ZAMORA acuñados" },
  { icon: ShieldCheck, value: 100, suffix: "%", label: "Registros verificables" },
];

export function Stats() {
  return (
    <section className="relative overflow-hidden bg-ink-gradient py-20 text-white">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="container relative">
        <Reveal>
          <p className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-white/50">
            Un programa que ya cobra vida en el campus
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i} className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-brand">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-black sm:text-4xl">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm text-white/50">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
