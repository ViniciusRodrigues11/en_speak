import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ComicCaptionProps = {
  eyebrow: string
  children: ReactNode
}

export function ComicCaption({ eyebrow, children }: ComicCaptionProps) {
  return (
    <aside className="mt-5 w-fit max-w-xl -rotate-[0.4deg] border-2 border-ink bg-accent-surface px-4 py-3 text-accent-foreground shadow-[4px_4px_0_var(--shadow-ink)]">
      <p className="text-[0.65rem] font-black tracking-[0.12em] uppercase">
        {eyebrow}
      </p>
      <p className="mt-0.5 text-sm leading-5 font-extrabold">{children}</p>
    </aside>
  )
}

type ComicFeedbackProps = {
  score: number
  className?: string
}

export function ComicFeedback({ score, className }: ComicFeedbackProps) {
  const isGood = score >= 70
  const label = isGood ? "BOA!" : "QUASE!"

  return (
    <div
      className={cn("comic-feedback", className)}
      role="status"
      aria-label={`${label} ${score} pontos`}
    >
      <span className={isGood ? "bg-accent" : "bg-secondary"}>
        <strong>{label}</strong>
        <small>{score} PTS</small>
      </span>
    </div>
  )
}

export function MicrophoneActionLines() {
  return <span className="comic-action-lines" aria-hidden="true" />
}
