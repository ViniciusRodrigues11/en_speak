import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, Clock3, Coffee, LockKeyhole, MapPin, Search, SearchX } from "lucide-react"
import { useMemo, useState } from "react"

import { dialogueCatalog } from "@/content/dialogues/catalog"
import type { DialogueCategory } from "@/features/dialogues/types"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/dialogos")({
  component: DialoguesPage,
})

type CatalogEntry = {
  id: string
  title: string
  description: string
  category: DialogueCategory
  level: "Básico" | "Intermediário"
  estimatedMinutes: number
  turnCount: number
  available: boolean
}

const upcomingDialogues: CatalogEntry[] = [
  {
    id: "pedindo-informacoes",
    title: "Pedindo informações",
    description: "Pergunte como chegar a um lugar e confirme as instruções.",
    category: "Viagem",
    level: "Básico",
    estimatedMinutes: 5,
    turnCount: 8,
    available: false,
  },
]

const normalizeSearch = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function DialoguesPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<DialogueCategory | "Todos">("Todos")
  const [selectedLevel, setSelectedLevel] = useState<"Todos" | CatalogEntry["level"]>("Todos")
  const entries: CatalogEntry[] = [
    ...dialogueCatalog.map((dialogue) => ({ ...dialogue, available: true })),
    ...upcomingDialogues,
  ]
  const categories = Array.from(new Set(entries.map((entry) => entry.category))).sort()
  const filteredEntries = useMemo(() => {
    const query = normalizeSearch(search.trim())

    return entries.filter((entry) => {
      const searchableText = normalizeSearch(
        `${entry.title} ${entry.description} ${entry.category}`,
      )

      return (
        (!query || searchableText.includes(query)) &&
        (selectedCategory === "Todos" || entry.category === selectedCategory) &&
        (selectedLevel === "Todos" || entry.level === selectedLevel)
      )
    })
  }, [entries, search, selectedCategory, selectedLevel])

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory("Todos")
    setSelectedLevel("Todos")
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
      <div className="max-w-2xl">
        <p className="font-black text-primary">ESCOLHA UMA CENA</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
          Diálogos para praticar
        </h1>
        <p className="mt-3 font-medium text-muted-foreground">
          Ouça o outro personagem e responda seguindo o roteiro.
        </p>
      </div>

      <div className="mt-7 rounded-2xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--shadow-ink)] md:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Pesquisar diálogos</span>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar situação..."
              className="h-11 w-full rounded-xl border-2 border-ink bg-background pr-4 pl-10 text-sm font-bold outline-none placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/20"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por nível</span>
            <select
              value={selectedLevel}
              onChange={(event) =>
                setSelectedLevel(event.target.value as "Todos" | CatalogEntry["level"])
              }
              className="h-11 w-full cursor-pointer rounded-xl border-2 border-ink bg-background px-3 text-sm font-black outline-none focus:ring-4 focus:ring-primary/20 sm:w-44"
            >
              <option value="Todos">Todos os níveis</option>
              <option value="Básico">Básico</option>
              <option value="Intermediário">Intermediário</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por categoria">
          {["Todos", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category as DialogueCategory | "Todos")}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border-2 border-ink px-3 py-1.5 text-xs font-black transition-colors",
                selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-muted-foreground">
          {filteredEntries.length} {filteredEntries.length === 1 ? "diálogo encontrado" : "diálogos encontrados"}
        </p>
      </div>

      {filteredEntries.length > 0 ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => (
            <DialogueCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border-2 border-dashed border-ink/35 px-5 py-12 text-center">
          <SearchX className="mx-auto size-7 text-muted-foreground" />
          <h2 className="mt-3 font-black">Nenhum diálogo encontrado</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Tente outra busca ou remova os filtros.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 cursor-pointer text-sm font-black text-primary underline underline-offset-4"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  )
}

function DialogueCard({ entry }: { entry: CatalogEntry }) {
  const content = (
    <article
      className={cn(
        "group flex h-full min-h-52 flex-col rounded-xl border-2 border-ink bg-card p-4 shadow-[3px_3px_0_var(--shadow-ink)] transition-[transform,box-shadow]",
        entry.available
          ? "hover:-translate-y-0.5 hover:shadow-[4px_5px_0_var(--shadow-ink)]"
          : "opacity-65",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink",
            entry.category === "Alimentação" ? "bg-accent" : "bg-secondary",
          )}
        >
          {entry.category === "Alimentação" ? (
            <Coffee className="size-5" strokeWidth={2.8} />
          ) : (
            <MapPin className="size-5" strokeWidth={2.8} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-black tracking-wide text-primary uppercase">
            {entry.category}
          </p>
          <h2 className="truncate text-lg font-black">{entry.title}</h2>
        </div>
        {entry.available ? (
          <ArrowRight className="mt-2 size-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={3} />
        ) : (
          <LockKeyhole className="mt-2 size-4 shrink-0 text-muted-foreground" />
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-5 font-medium text-muted-foreground">
        {entry.description}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-4 text-[0.68rem] font-black tracking-wide text-muted-foreground uppercase">
        <span>{entry.level}</span>
        <span aria-hidden="true">·</span>
        <span>{entry.turnCount} falas</span>
        <span className="ml-auto inline-flex items-center gap-1">
          <Clock3 className="size-3" /> {entry.estimatedMinutes} min
        </span>
      </div>
      {!entry.available && (
        <p className="mt-3 border-t-2 border-ink/10 pt-2 text-xs font-black text-muted-foreground uppercase">
          Em breve
        </p>
      )}
    </article>
  )

  if (!entry.available) return content

  return (
    <Link
      to="/pratica/$dialogueId"
      params={{ dialogueId: entry.id }}
      className="rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      aria-label={`Praticar ${entry.title}`}
    >
      {content}
    </Link>
  )
}
