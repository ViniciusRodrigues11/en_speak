import { Link } from "@tanstack/react-router"
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Check,
  Languages,
  LoaderCircle,
  Mic,
  RotateCcw,
  Sparkles,
  Square,
  Trophy,
  UserRound,
  Volume2,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { scoreResponse } from "@/features/dialogues/score-response"
import type { Dialogue, DialogueLine } from "@/features/dialogues/types"
import { useSpeechRecognition } from "@/features/speech/use-speech-recognition"
import { useSpeechSynthesis } from "@/features/speech/use-speech-synthesis"
import { cn } from "@/lib/utils"

type PracticeStatus =
  | "idle"
  | "bot-speaking"
  | "example-speaking"
  | "requesting-microphone"
  | "listening"
  | "result"
  | "recognition-error"
  | "complete"

type Attempt = {
  responseId: string
  score: number
  transcript: string
}

type PracticeConversationProps = {
  dialogue: Dialogue
}

export function PracticeConversation({ dialogue }: PracticeConversationProps) {
  const [turnIndex, setTurnIndex] = useState(0)
  const [status, setStatus] = useState<PracticeStatus>("idle")
  const [selectedResponseId, setSelectedResponseId] = useState(dialogue.turns[0].responses[0].id)
  const [bestAttempts, setBestAttempts] = useState<Record<string, Attempt>>({})
  const [completedAttempts, setCompletedAttempts] = useState<Record<string, Attempt>>({})
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null)
  const [recognitionError, setRecognitionError] = useState("")
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const { isSupported: isSpeechSupported, speak } = useSpeechSynthesis()
  const turn = dialogue.turns[turnIndex]
  const selectedResponse =
    turn.responses.find((response) => response?.id === selectedResponseId) ?? turn.responses[0]
  const {
    isSupported: isRecognitionSupported,
    reset: resetRecognition,
    start: startRecognition,
    stop: stopRecognition,
    transcript,
  } = useSpeechRecognition({
    onStart: () => setStatus("listening"),
    onResult: (result) => {
      const score = scoreResponse(selectedResponse.text, result.transcript)
      const attempt = {
        responseId: selectedResponse.id,
        score,
        transcript: result.transcript,
      }

      setCurrentAttempt(attempt)
      setBestAttempts((attempts) => {
        const previous = attempts[turn.id]
        return !previous || attempt.score > previous.score
          ? { ...attempts, [turn.id]: attempt }
          : attempts
      })
      setStatus("result")
    },
    onError: (message) => {
      setRecognitionError(message)
      setStatus("recognition-error")
    },
  })

  const beginRecognition = () => {
    setCurrentAttempt(null)
    setRecognitionError("")
    setStatus("requesting-microphone")
    void startRecognition()
  }

  useEffect(() => {
    if (status !== "bot-speaking") return

    if (!isSpeechSupported) {
      const fallbackTimer = window.setTimeout(beginRecognition, 700)
      return () => window.clearTimeout(fallbackTimer)
    }

    return speak(turn.bot.text, {
      onEnd: beginRecognition,
      onError: beginRecognition,
    })
  }, [isSpeechSupported, speak, status, turn.bot.text])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [status, turnIndex])

  const completedTurns = dialogue.turns.slice(
    0,
    status === "complete" ? dialogue.turns.length : turnIndex,
  )

  const restart = () => {
    resetRecognition()
    setTurnIndex(0)
    setSelectedResponseId(dialogue.turns[0].responses[0].id)
    setBestAttempts({})
    setCompletedAttempts({})
    setCurrentAttempt(null)
    setRecognitionError("")
    setStatus("idle")
  }

  const retry = () => {
    resetRecognition()
    setCurrentAttempt(null)
    setRecognitionError("")
    setStatus("bot-speaking")
  }

  const replayBotTurn = () => {
    resetRecognition()
    setCurrentAttempt(null)
    setRecognitionError("")
    setStatus("bot-speaking")
  }

  const playSelectedResponse = () => {
    const shouldResumePractice = status !== "idle"

    resetRecognition()
    setCurrentAttempt(null)
    setRecognitionError("")
    setStatus("example-speaking")

    const finishExample = () => {
      if (shouldResumePractice) {
        beginRecognition()
      } else {
        setStatus("idle")
      }
    }

    speak(selectedResponse.text, {
      onEnd: finishExample,
      onError: finishExample,
    })
  }

  const advance = () => {
    const bestAttempt = bestAttempts[turn.id]

    if (!bestAttempt || bestAttempt.score === 0) {
      retry()
      return
    }

    setCompletedAttempts((attempts) => ({ ...attempts, [turn.id]: bestAttempt }))
    resetRecognition()
    setCurrentAttempt(null)

    if (turnIndex === dialogue.turns.length - 1) {
      setStatus("complete")
      return
    }

    const nextTurnIndex = turnIndex + 1
    setTurnIndex(nextTurnIndex)
    setSelectedResponseId(dialogue.turns[nextTurnIndex].responses[0].id)
    setStatus("bot-speaking")
  }

  useEffect(() => {
    if (status !== "result" || !currentAttempt) return

    const timer = window.setTimeout(() => {
      if (currentAttempt.score === 0) {
        retry()
        return
      }

      advance()
    }, 1600)

    return () => window.clearTimeout(timer)
  }, [currentAttempt, status])

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6 md:px-5 md:py-10">
      <header className="flex items-center gap-4 border-b-2 border-ink/15 pb-5">
        <Link
          to="/dialogos"
          className="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-card shadow-[2px_2px_0_var(--ink)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          aria-label="Voltar aos diálogos"
        >
          <ArrowLeft className="size-5" strokeWidth={3} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black md:text-2xl">{dialogue.title}</h1>
          <p className="text-sm font-bold text-muted-foreground">
            {status === "complete"
              ? "Diálogo concluído"
              : `Fala ${turnIndex + 1} de ${dialogue.turns.length}`}
          </p>
        </div>
        <span className="rounded-full border-2 border-ink bg-accent px-3 py-1 text-xs font-black">
          {dialogue.level.toUpperCase()}
        </span>
      </header>

      <div className="mt-4 h-2 overflow-hidden rounded-full border border-ink bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{
            width: `${((status === "complete" ? dialogue.turns.length : turnIndex) / dialogue.turns.length) * 100}%`,
          }}
        />
      </div>

      <div className="mt-7 flex flex-col gap-4" aria-live="polite">
        {completedTurns.map((completedTurn) => {
          const attempt = completedAttempts[completedTurn.id]
          const response =
            completedTurn.responses.find((option) => option?.id === attempt?.responseId) ??
            completedTurn.responses[0]

          return (
            <div key={completedTurn.id} className="space-y-3 opacity-75">
              <ConversationLine
                speaker={dialogue.botCharacter}
                line={completedTurn.bot}
                type="bot"
                completed
                replayDisabled={status !== "complete"}
                onReplay={() => speak(completedTurn.bot.text)}
              />
              <ConversationLine
                speaker="Você"
                line={response}
                type="user"
                completed
                score={attempt?.score}
              />
            </div>
          )
        })}

        {status !== "complete" && (
          <div className="space-y-4">
            <ConversationLine
              speaker={dialogue.botCharacter}
              line={turn.bot}
              type="bot"
              active={status === "bot-speaking"}
              replayDisabled={
                status === "bot-speaking" ||
                status === "example-speaking" ||
                status === "requesting-microphone" ||
                status === "listening"
              }
              onReplay={replayBotTurn}
            />

            <div className="ml-auto w-[92%] max-w-xl rounded-xl border-2 border-ink bg-secondary/25 p-4 shadow-[3px_3px_0_var(--ink)] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs font-black tracking-wide">
                  <UserRound className="size-4" /> SUA VEZ
                </p>
                {turn.responses[1] && (
                  <div className="flex gap-1.5" aria-label="Escolha uma resposta">
                    {turn.responses.map(
                      (response, index) =>
                        response && (
                          <Button
                            key={response.id}
                            type="button"
                            size="sm"
                            variant={selectedResponseId === response.id ? "secondary" : "outline"}
                            className="h-8 rounded-md px-2.5 text-xs shadow-[2px_2px_0_var(--ink)]"
                            onClick={() => setSelectedResponseId(response.id)}
                            aria-pressed={selectedResponseId === response.id}
                            disabled={
                              status === "requesting-microphone" ||
                              status === "listening" ||
                              status === "result"
                            }
                          >
                            {index + 1}
                          </Button>
                        ),
                    )}
                  </div>
                )}
              </div>

              {turn.responses.map(
                (response) =>
                  response?.id === selectedResponseId && (
                    <TranslatableLine key={response.id} line={response} className="mt-3" />
                  ),
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-2 text-xs"
                onClick={playSelectedResponse}
                disabled={
                  status === "bot-speaking" ||
                  status === "example-speaking" ||
                  status === "requesting-microphone" ||
                  status === "result"
                }
              >
                <Volume2 className="size-4" />
                Ouvir esta resposta
              </Button>

              {(status === "requesting-microphone" || status === "listening") && (
                <div className="mt-4 rounded-lg border-2 border-ink/20 bg-card/70 px-3 py-2.5">
                  <p className="text-[0.68rem] font-black tracking-wide text-muted-foreground uppercase">
                    Transcrição
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {transcript ||
                      (status === "requesting-microphone"
                        ? "Aguardando o microfone..."
                        : "Fale a frase escolhida.")}
                  </p>
                </div>
              )}

              {status === "result" && currentAttempt && (
                <div className="mt-4 flex items-start justify-between gap-4 rounded-lg border-2 border-ink bg-card px-3 py-2.5">
                  <div>
                    <p className="text-[0.68rem] font-black tracking-wide text-muted-foreground uppercase">
                      O navegador entendeu
                    </p>
                    <p className="mt-1 text-sm font-bold">“{currentAttempt.transcript}”</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-md border-2 border-ink bg-accent px-2 py-1 text-sm font-black">
                      {currentAttempt.score} pts
                    </span>
                    <p className="mt-1 text-[0.62rem] font-black text-muted-foreground uppercase">
                      Melhor: {bestAttempts[turn.id]?.score ?? currentAttempt.score}
                    </p>
                  </div>
                </div>
              )}

              {status === "recognition-error" && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border-2 border-primary bg-primary/10 px-3 py-2.5 text-sm font-bold">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  {recognitionError}
                </div>
              )}
            </div>
          </div>
        )}

        {status === "complete" && (
          <div className="rounded-xl border-2 border-ink bg-accent p-5 text-center shadow-[4px_4px_0_var(--ink)]">
            <Trophy className="mx-auto size-8" strokeWidth={2.8} />
            <h2 className="mt-2 text-xl font-black">Diálogo concluído!</h2>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              Suas melhores tentativas foram mantidas em cada fala.
            </p>
          </div>
        )}

        <div ref={conversationEndRef} />
      </div>

      <MicrophoneDock
        status={status}
        currentScore={currentAttempt?.score}
        recognitionSupported={isRecognitionSupported}
        speechSupported={isSpeechSupported}
        transcript={transcript}
        onStatusChange={setStatus}
        onRetry={retry}
        onRestart={restart}
        onStop={stopRecognition}
      />
    </section>
  )
}

type ConversationLineProps = {
  speaker: string
  line: DialogueLine
  type: "bot" | "user"
  active?: boolean
  completed?: boolean
  score?: number
  replayDisabled?: boolean
  onReplay?: () => void
}

function ConversationLine({
  speaker,
  line,
  type,
  active,
  completed,
  score,
  replayDisabled,
  onReplay,
}: ConversationLineProps) {
  return (
    <div className={cn("flex max-w-xl items-start gap-2.5", type === "user" && "ml-auto flex-row-reverse")}>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink",
          type === "bot" ? "bg-accent" : "bg-secondary",
        )}
      >
        {type === "bot" ? <Bot className="size-4" /> : <UserRound className="size-4" />}
      </span>
      <div
        className={cn(
          "min-w-0 rounded-xl border-2 border-ink bg-card px-4 py-3 shadow-[2px_2px_0_var(--ink)]",
          type === "user" && "bg-secondary/20",
          active && "ring-4 ring-accent/50",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-[0.68rem] font-black tracking-wide text-muted-foreground uppercase">{speaker}</p>
            {completed && <Check className="size-3.5 text-primary" strokeWidth={3} />}
            {score !== undefined && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-[0.62rem] font-black text-foreground">
                {score} pts
              </span>
            )}
          </div>
          {type === "bot" && onReplay && (
            <button
              type="button"
              className="grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              onClick={onReplay}
              disabled={replayDisabled}
              aria-label={`Ouvir novamente a fala de ${speaker}`}
            >
              <Volume2 className="size-4" />
            </button>
          )}
        </div>
        <TranslatableLine line={line} className="mt-1" />
      </div>
    </div>
  )
}

type TranslatableLineProps = {
  line: DialogueLine
  className?: string
}

function TranslatableLine({ line, className }: TranslatableLineProps) {
  const [translationVisible, setTranslationVisible] = useState(false)

  return (
    <div className={className}>
      <p className="text-base leading-6 font-extrabold md:text-lg">{line.text}</p>
      {translationVisible && (
        <p className="mt-1.5 text-sm leading-5 font-semibold text-muted-foreground">{line.translation}</p>
      )}
      <button
        type="button"
        className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-foreground"
        onClick={() => setTranslationVisible((visible) => !visible)}
      >
        <Languages className="size-3.5" />
        {translationVisible ? "Ocultar" : "Traduzir"}
      </button>
    </div>
  )
}

type MicrophoneDockProps = {
  status: PracticeStatus
  currentScore?: number
  recognitionSupported: boolean
  speechSupported: boolean
  transcript: string
  onRetry: () => void
  onStatusChange: (status: PracticeStatus) => void
  onRestart: () => void
  onStop: () => void
}

const statusContent = {
  idle: {
    eyebrow: "PRONTO PARA COMEÇAR",
    description: "Toque no microfone para iniciar o fluxo.",
  },
  "bot-speaking": {
    eyebrow: "BOT FALANDO",
    description: "O microfone abrirá quando a fala terminar.",
  },
  "example-speaking": {
    eyebrow: "EXEMPLO DE PRONÚNCIA",
    description: "Ouça a resposta; o microfone abrirá novamente ao final.",
  },
  "requesting-microphone": {
    eyebrow: "PREPARANDO MICROFONE",
    description: "Confirme a permissão solicitada pelo navegador.",
  },
  listening: {
    eyebrow: "SUA VEZ",
    description: "Ouvindo... toque para encerrar a resposta.",
  },
  result: {
    eyebrow: "TENTATIVA CONCLUÍDA",
    description: "Preparando a próxima etapa do diálogo.",
  },
  "recognition-error": {
    eyebrow: "VAMOS TENTAR DE NOVO",
    description: "Não foi possível concluir esta tentativa.",
  },
  complete: {
    eyebrow: "CONCLUÍDO",
    description: "Você chegou ao fim deste diálogo.",
  },
} satisfies Record<PracticeStatus, { eyebrow: string; description: string }>

function MicrophoneDock({
  status,
  currentScore,
  recognitionSupported,
  speechSupported,
  transcript,
  onRetry,
  onStatusChange,
  onRestart,
  onStop,
}: MicrophoneDockProps) {
  const content = statusContent[status]
  const start = () => onStatusChange("bot-speaking")
  const description = status === "listening" && transcript ? transcript : content.description

  return (
    <aside className="sticky bottom-3 z-20 mt-8 rounded-2xl border-2 border-ink bg-card/95 p-3 shadow-[5px_5px_0_var(--ink)] backdrop-blur md:p-4">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="text-xs font-black tracking-wide text-primary">{content.eyebrow}</p>
          <p className="mt-0.5 truncate text-sm font-bold text-muted-foreground">{description}</p>
        </div>

        {status === "complete" ? (
          <Button type="button" variant="secondary" size="sm" onClick={onRestart}>
            <RotateCcw className="size-4" />
            Refazer
          </Button>
        ) : status === "result" ? (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 border-ink bg-accent px-3 py-2 text-sm font-black">
            <LoaderCircle className="size-4 animate-spin" />
            {(currentScore ?? 0) === 0 ? "Nova tentativa" : "Avançando"}
          </span>
        ) : status === "recognition-error" ? (
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            <RotateCcw className="size-4" />
            Tentar novamente
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className={cn(
              "size-16 shrink-0 rounded-full p-0 shadow-[4px_4px_0_var(--ink)]",
              status === "listening" && "motion-safe:animate-pulse ring-4 ring-primary/25",
            )}
            variant={
              status === "bot-speaking" ||
              status === "example-speaking" ||
              status === "requesting-microphone"
                ? "outline"
                : "primary"
            }
            disabled={
              status === "bot-speaking" ||
              status === "example-speaking" ||
              status === "requesting-microphone"
            }
            onClick={status === "idle" ? start : onStop}
            aria-label={status === "idle" ? "Iniciar diálogo" : "Encerrar resposta"}
          >
            {status === "idle" && <Mic className="size-7" strokeWidth={2.8} />}
            {status === "bot-speaking" && <Volume2 className="size-7" strokeWidth={2.8} />}
            {status === "example-speaking" && <Volume2 className="size-7" strokeWidth={2.8} />}
            {status === "requesting-microphone" && (
              <LoaderCircle className="size-7 animate-spin" strokeWidth={2.8} />
            )}
            {status === "listening" && <Square className="size-6 fill-current" strokeWidth={2.8} />}
          </Button>
        )}
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.68rem] font-bold text-muted-foreground">
        <Sparkles className="size-3 text-accent-foreground" />
        {!recognitionSupported
          ? "O reconhecimento de voz não está disponível neste navegador"
          : speechSupported
            ? "Voz e transcrição processadas pelo navegador — nenhum áudio é armazenado"
            : "Transcrição disponível, mas a síntese de voz não é compatível"}
      </p>
    </aside>
  )
}
