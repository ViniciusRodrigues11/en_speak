import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, Headphones, Mic2, Trophy } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: HomePage,
})

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
    description: "Escolha uma resposta e pratique falando em voz alta.",
    color: "bg-secondary",
  },
  {
    icon: Trophy,
    title: "Melhore",
    description: "Refaça o diálogo e supere a sua melhor pontuação.",
    color: "bg-primary",
  },
]

function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b-2 border-ink bg-hero-pattern">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-24">
          <div>
            <span className="inline-flex rotate-[-2deg] items-center rounded-lg border-2 border-ink bg-accent px-3 py-1 text-sm font-black shadow-[3px_3px_0_var(--ink)]">
              SPEAKING + LISTENING
            </span>
            <h1 className="mt-7 max-w-3xl text-5xl leading-[0.95] font-black tracking-[-0.045em] text-balance md:text-7xl">
              Entre no diálogo. <span className="text-primary">Solte a voz.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 font-semibold text-muted-foreground">
              Pratique conversas em inglês com roteiros guiados, no seu ritmo e sem medo de errar.
            </p>
            <Link
              to="/dialogos"
              className={cn(buttonVariants({ size: "lg" }), "mt-8")}
            >
              Ver diálogos
              <ArrowRight className="size-5" strokeWidth={3} />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rotate-3 rounded-[2rem] border-[3px] border-ink bg-card p-6 shadow-[10px_10px_0_var(--ink)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black">CAFETERIA</span>
                <span className="text-sm font-black text-primary">1 / 6</span>
              </div>
              <p className="mt-8 text-sm font-extrabold text-muted-foreground">ATENDENTE</p>
              <p className="mt-2 text-2xl leading-snug font-black">Good morning! What would you like?</p>
              <div className="mt-7 h-2 overflow-hidden rounded-full border border-ink bg-muted">
                <div className="h-full w-1/3 bg-primary" />
              </div>
              <div className="mt-6 grid size-20 place-items-center rounded-full border-[3px] border-ink bg-primary text-primary-foreground shadow-[5px_5px_0_var(--ink)]">
                <Mic2 className="size-9" strokeWidth={2.8} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-black tracking-tight">Treine em três passos</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description, color }) => (
            <article
              key={title}
              className="rounded-2xl border-2 border-ink bg-card p-6 shadow-[5px_5px_0_var(--ink)]"
            >
              <span className={cn("grid size-12 place-items-center rounded-xl border-2 border-ink", color)}>
                <Icon className="size-6" strokeWidth={2.8} />
              </span>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-2 leading-7 font-medium text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
