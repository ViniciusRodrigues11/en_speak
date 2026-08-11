import { Check, Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { useTheme, type Theme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const themes: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: "system", label: "Tema automático", Icon: Monitor },
  { value: "light", label: "Tema claro", Icon: Sun },
  { value: "dark", label: "Tema escuro", Icon: Moon },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentTheme = themes.find(({ value }) => value === theme) ?? themes[0]
  const Icon = currentTheme.Icon

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg border-2 border-ink bg-card shadow-[2px_2px_0_var(--shadow-ink)] transition-[transform,background-color,box-shadow] outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/35 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        aria-label={`${currentTheme.label}. Escolher tema.`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={currentTheme.label}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon className="size-5" strokeWidth={2.6} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+0.65rem)] right-0 z-50 w-48 rounded-xl border-2 border-ink bg-card p-1.5 shadow-[4px_4px_0_var(--shadow-ink)]"
          role="menu"
          aria-label="Escolher tema"
        >
          {themes.map(({ value, label, Icon: ThemeIcon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === value}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-extrabold outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                theme === value && "bg-secondary text-secondary-foreground hover:bg-secondary",
              )}
              onClick={() => {
                setTheme(value)
                setOpen(false)
              }}
            >
              <ThemeIcon className="size-4" aria-hidden="true" />
              <span className="flex-1">{label.replace("Tema ", "")}</span>
              {theme === value && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
