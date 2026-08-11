import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Headphones, Mic2, Sparkles, Trophy } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const benefits = [
  {
    icon: Headphones,
    title: "Escute",
    description: "Ouça cada fala em inglês dentro de uma situação real.",
    color: "bg-accent",
  },
  {
    icon: Mic2,
    title: "Responda",
    description: "Acompanhe a frase sugerida e pratique falando em voz alta.",
    color: "bg-secondary",
  },
  {
    icon: Trophy,
    title: "Melhore",
    description: "Refaça o diálogo e supere a sua melhor pontuação.",
    color: "bg-primary",
  },
];

function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b-2 border-ink bg-hero-pattern">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-black tracking-wide text-primary">
              <Sparkles className="size-4" />
              SPEAKING + LISTENING
            </span>
            <h1 className="mt-7 max-w-3xl text-5xl leading-[0.95] font-black tracking-[-0.045em] text-balance md:text-7xl">
              Entre no diálogo.{" "}
              <span className="text-primary">Solte a voz.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 font-semibold text-muted-foreground">
              Pratique conversas em inglês com roteiros guiados, no seu ritmo e
              sem medo de errar.
            </p>
            <Link
              to="/dialogos"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 w-full text-base shadow-[6px_6px_0_var(--ink)] sm:w-auto",
              )}
            >
              Começar a praticar
              <ArrowRight className="size-5" strokeWidth={3} />
            </Link>
          </div>

          <div
            className="pointer-events-none relative mx-auto w-full max-w-sm select-none"
            role="img"
            aria-label="Exemplo de uma prática"
          >
            <div className="rotate-3 rounded-[2rem] border-[3px] border-ink bg-card p-6 shadow-[10px_10px_0_var(--ink)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black">
                  CAFETERIA
                </span>
                <span className="text-sm font-black text-primary">1 / 6</span>
              </div>
              <p className="mt-8 text-sm font-extrabold text-muted-foreground">
                ATENDENTE
              </p>
              <p className="mt-2 text-2xl leading-snug font-black">
                Good morning! What can I get for you?
              </p>
              <div className="mt-6 ml-7 rounded-xl border-2 border-ink bg-secondary/20 px-4 py-3">
                <p className="text-[0.65rem] font-black tracking-wide text-muted-foreground uppercase">
                  Você
                </p>
                <p className="mt-1 text-lg font-black">
                  I'd like a coffee, please.
                </p>
              </div>
              <div className="mt-7 h-2 overflow-hidden rounded-full border border-ink bg-muted">
                <div className="h-full w-1/3 bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-black tracking-tight">
          Treine em três passos
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          {benefits.map(({ icon: Icon, title, description, color }, index) => (
            <article key={title} className="flex items-start gap-4 md:block">
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-xl",
                  color,
                )}
              >
                <Icon className="size-6" strokeWidth={2.8} />
              </span>
              <div className="md:mt-4">
                <p className="text-xs font-black tracking-wide text-primary">
                  PASSO {index + 1}
                </p>
                <h3 className="mt-1 text-xl font-black">{title}</h3>
                <p className="mt-1 leading-7 font-medium text-muted-foreground">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
