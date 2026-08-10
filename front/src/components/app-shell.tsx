import { Link } from "@tanstack/react-router"
import { Headphones, Sparkles } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b-2 border-ink bg-card/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3" aria-label="En Speak — início">
            <span className="grid size-11 rotate-[-3deg] place-items-center rounded-xl border-2 border-ink bg-accent shadow-[3px_3px_0_var(--ink)]">
              <Headphones className="size-6" strokeWidth={2.8} />
            </span>
            <span className="text-xl font-black tracking-tight">EN SPEAK!</span>
          </Link>

          <nav aria-label="Navegação principal" className="flex items-center gap-2">
            <NavLink to="/">Início</NavLink>
            <NavLink to="/dialogos">Diálogos</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t-2 border-ink bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 text-sm font-bold">
          <span>En Speak</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Speaking sem pressão
          </span>
        </div>
      </footer>
    </div>
  )
}

type NavLinkProps = {
  children: ReactNode
  to: "/" | "/dialogos"
}

function NavLink({ children, to }: NavLinkProps) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="rounded-lg px-3 py-2 text-sm font-extrabold transition-colors hover:bg-muted"
      activeProps={{ className: cn("bg-secondary text-secondary-foreground") }}
    >
      {children}
    </Link>
  )
}
