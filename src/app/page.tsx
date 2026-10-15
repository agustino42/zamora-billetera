import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks, Features } from "@/components/landing/how-it-works";
import { Economy } from "@/components/landing/economy";
import { Roles } from "@/components/landing/roles";
import { Courses } from "@/components/landing/courses";
import { Stats } from "@/components/landing/stats";
import { CtaBand, SiteFooter } from "@/components/landing/cta-footer";
import { ScrollProgress } from "@/components/landing/scroll-progress";

export default function LandingPage() {
  return (
    <div className="min-h-screen scroll-smooth">
      <ScrollProgress />
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Economy />
        <Roles />
        <Courses />
        <Stats />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
