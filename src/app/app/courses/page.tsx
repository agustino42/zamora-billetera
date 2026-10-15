"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Award, BookOpen, GraduationCap, ShoppingCart, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { demoCourses } from "@/lib/mock-data";

export default function CoursesPage() {
  const [enrolled, setEnrolled] = useState<string[]>(
    demoCourses.filter((c) => c.enrolledSelf).map((c) => c.id),
  );
  const [claimed, setClaimed] = useState<string[]>([]);

  const enroll = (id: string, title: string, price: number) => {
    setEnrolled((prev) => [...prev, id]);
    toast.success(`Te inscribiste en "${title}"`, {
      description: `Se descontaron ${price} ZAMORA (80% instructor / 20% quemado).`,
    });
  };

  const claimCert = (id: string, title: string) => {
    setClaimed((prev) => [...prev, id]);
    toast.success("Certificado emitido", {
      description: `NFT soulbound verifiable para "${title}".`,
      icon: <Award className="h-4 w-4" />,
    });
  };

  return (
    <div>
      <PageHeader
        title="Cursos"
        description="Aprende con cursos del campus y de tus compañeros. Al completarlos recibes un certificado NFT."
      />

      <Tabs defaultValue="enrolled">
        <TabsList>
          <TabsTrigger value="enrolled">Mis cursos</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          <div className="grid gap-4 md:grid-cols-2">
            {demoCourses
              .filter((c) => enrolled.includes(c.id))
              .map((c) => {
                const done = c.progress >= 100;
                return (
                  <Card key={c.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                            <BookOpen className="h-5 w-5" />
                          </span>
                          <div>
                            <h3 className="font-display font-bold">{c.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {c.instructorName}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{c.category}</Badge>
                      </div>
                      <div className="mt-4">
                        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                          <span>Progreso</span>
                          <span>{c.progress}%</span>
                        </div>
                        <Progress value={c.progress} />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {c.completed} certificados emitidos
                        </span>
                        {done && !claimed.includes(c.id) ? (
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => claimCert(c.id, c.title)}
                          >
                            <Award className="h-4 w-4" />
                            Reclamar certificado
                          </Button>
                        ) : claimed.includes(c.id) ? (
                          <Badge variant="success">Certificado emitido</Badge>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            En curso
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="catalog">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoCourses
              .filter((c) => !enrolled.includes(c.id))
              .map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="flex h-full flex-col">
                    <div className="relative grid h-28 place-items-center rounded-t-2xl bg-ink-gradient">
                      <div className="absolute inset-0 grid-pattern opacity-30" />
                      <GraduationCap className="h-9 w-9 text-brand" />
                      <Badge className="absolute right-3 top-3 bg-white/10 text-white">
                        {c.category}
                      </Badge>
                    </div>
                    <CardContent className="flex flex-1 flex-col p-5">
                      <h3 className="font-display font-bold">{c.title}</h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {c.enrolled}/{c.seats}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="font-display text-lg font-black">
                          {c.price}
                          <span className="ml-1 text-xs text-brand">ZAM</span>
                        </span>
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => enroll(c.id, c.title, c.price)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Inscribirme
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
