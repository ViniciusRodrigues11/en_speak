import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, Coffee, LockKeyhole, MapPin } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { dialogueCatalog } from "@/content/dialogues/catalog"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/dialogos")({
  component: DialoguesPage,
})

function DialoguesPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="max-w-2xl">
        <p className="font-black text-primary">ESCOLHA UMA CENA</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Diálogos para praticar</h1>
        <p className="mt-4 text-lg leading-8 font-medium text-muted-foreground">
          Ouça o outro personagem e responda seguindo o roteiro.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {dialogueCatalog.map(({ id, title, description, turnCount, level, estimatedMinutes }) => (
          <article
            key={id}
            className="rounded-2xl border-2 border-ink bg-card p-6 shadow-[5px_5px_0_var(--ink)]"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-14 place-items-center rounded-xl border-2 border-ink bg-accent">
                <Coffee className="size-7" strokeWidth={2.8} />
              </span>
              <span className="rounded-full border-2 border-ink bg-muted px-3 py-1 text-xs font-black">
                {turnCount} FALAS
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-black">{title}</h2>
            <p className="mt-2 min-h-14 leading-7 font-medium text-muted-foreground">{description}</p>
            <p className="mt-3 text-xs font-black tracking-wide text-muted-foreground">
              {level.toUpperCase()} · CERCA DE {estimatedMinutes} MIN
            </p>
            <Link
              to="/pratica/$dialogueId"
              params={{ dialogueId: id }}
              className={cn(buttonVariants({ variant: "secondary" }), "mt-6")}
            >
              Começar
              <ArrowRight className="size-4" strokeWidth={3} />
            </Link>
          </article>
        ))}

        <article className="rounded-2xl border-2 border-ink bg-card p-6 opacity-60 shadow-[5px_5px_0_var(--ink)]">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-14 place-items-center rounded-xl border-2 border-ink bg-secondary">
              <MapPin className="size-7" strokeWidth={2.8} />
            </span>
            <span className="rounded-full border-2 border-ink bg-muted px-3 py-1 text-xs font-black">8 FALAS</span>
          </div>
          <h2 className="mt-6 text-2xl font-black">Pedindo informações</h2>
          <p className="mt-2 min-h-14 leading-7 font-medium text-muted-foreground">
            Pergunte como chegar a um lugar e confirme as instruções.
          </p>
          <span className="mt-6 inline-flex h-12 items-center gap-2 px-1 text-sm font-black text-muted-foreground">
            <LockKeyhole className="size-4" /> Em breve
          </span>
        </article>
      </div>
    </section>
  )
}
