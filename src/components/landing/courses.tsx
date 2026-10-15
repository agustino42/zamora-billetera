"use client";

import { RevealStagger, StaggerItem, SectionHeading } from "./reveal";
import { Badge } from "@/components/ui/badge";
import { Award, Clock, Users } from "lucide-react";
import { demoCourses } from "@/lib/mock-data";

export function Courses() {
  return (
    <section id="cursos" className="relative py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Marketplace de cursos"
          title="Aprende y certifícate on-chain"
          description="Cursos creados por profesores y alumnos avanzados. Paga con ZAMORA y recibe un certificado NFT verificable."
        />

        <RevealStagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoCourses.map((course) => (
            <StaggerItem key={course.id}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative grid h-32 place-items-center bg-ink-gradient">
                  <div className="absolute inset-0 grid-pattern opacity-30" />
                  <Award className="h-10 w-10 text-brand" />
                  <Badge className="absolute right-3 top-3 bg-white/10 text-white">
                    {course.category}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display font-bold leading-tight">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.enrolled}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.completed} cert.
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-display text-lg font-black">
                      {course.price}
                      <span className="ml-1 text-xs font-semibold text-brand">
                        ZAM
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {course.instructorName}
                    </span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
