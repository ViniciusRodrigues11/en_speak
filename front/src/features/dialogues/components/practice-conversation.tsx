import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bot,
  Check,
  Languages,
  LoaderCircle,
  Mic,
  RotateCcw,
  Settings2,
  Square,
  Trophy,
  UserRound,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { scoreResponse } from "@/features/dialogues/score-response";
import type { Dialogue, DialogueLine } from "@/features/dialogues/types";
import { useSpeechRecognition } from "@/features/speech/use-speech-recognition";
import { useSpeechSynthesis } from "@/features/speech/use-speech-synthesis";
import { cn } from "@/lib/utils";

type PracticeStatus =
  | "idle"
  | "bot-speaking"
  | "example-speaking"
  | "requesting-microphone"
  | "listening"
  | "result"
  | "recognition-error"
  | "complete";

type Attempt = {
  responseId: string;
  score: number;
  transcript: string;
};

type PracticeConversationProps = {
  dialogue: Dialogue;
};

function createResponsePlan(dialogue: Dialogue) {
  return dialogue.turns.map((turn) => {
    const responses = turn.responses.filter(
      (response) => response !== undefined,
    );
    return responses[Math.floor(Math.random() * responses.length)].id;
  });
}

export function PracticeConversation({ dialogue }: PracticeConversationProps) {
  const [turnIndex, setTurnIndex] = useState(0);
  const [status, setStatus] = useState<PracticeStatus>("idle");
  const [responsePlan, setResponsePlan] = useState(() =>
    createResponsePlan(dialogue),
  );
  const [bestAttempts, setBestAttempts] = useState<Record<string, Attempt>>({});
  const [completedAttempts, setCompletedAttempts] = useState<
    Record<string, Attempt>
  >({});
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [recognitionError, setRecognitionError] = useState("");
  const [translationsVisible, setTranslationsVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.92);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const speechStartedFromClickRef = useRef(false);
  const { isSupported: isSpeechSupported, speak } = useSpeechSynthesis();
  const turn = dialogue.turns[turnIndex];
  const selectedResponse =
    turn.responses.find(
      (response) => response?.id === responsePlan[turnIndex],
    ) ?? turn.responses[0];
  const {
    reset: resetRecognition,
    start: startRecognition,
    stop: stopRecognition,
    transcript,
  } = useSpeechRecognition({
    onStart: () => setStatus("listening"),
    onResult: (result) => {
      const score = scoreResponse(selectedResponse.text, result.transcript);
      const attempt = {
        responseId: selectedResponse.id,
        score,
        transcript: result.transcript,
      };

      setCurrentAttempt(attempt);
      setBestAttempts((attempts) => {
        const previous = attempts[turn.id];
        return !previous || attempt.score > previous.score
          ? { ...attempts, [turn.id]: attempt }
          : attempts;
      });
      setStatus("result");
    },
    onError: (message) => {
      setRecognitionError(message);
      setStatus("recognition-error");
    },
  });

  const beginRecognition = () => {
    setCurrentAttempt(null);
    setRecognitionError("");
    setStatus("requesting-microphone");
    void startRecognition();
  };

  const startPractice = () => {
    setStatus("bot-speaking");

    if (!isSpeechSupported) return;

    speechStartedFromClickRef.current = true;
    speak(turn.bot.text, {
      onEnd: beginRecognition,
      onError: beginRecognition,
      rate: speechRate,
    });
  };

  useEffect(() => {
    if (status !== "bot-speaking") return;

    if (speechStartedFromClickRef.current) {
      speechStartedFromClickRef.current = false;
      return;
    }

    if (!isSpeechSupported) {
      const fallbackTimer = window.setTimeout(beginRecognition, 700);
      return () => window.clearTimeout(fallbackTimer);
    }

    return speak(turn.bot.text, {
      onEnd: beginRecognition,
      onError: beginRecognition,
      rate: speechRate,
    });
  }, [isSpeechSupported, speak, speechRate, status, turn.bot.text]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      conversationEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [settingsOpen, status, turnIndex]);

  useEffect(() => {
    if (!settingsOpen) return;

    const timer = window.setTimeout(() => setSettingsOpen(false), 5000);
    return () => window.clearTimeout(timer);
  }, [settingsOpen, speechRate]);

  useEffect(() => {
    if (status === "requesting-microphone" || status === "listening") {
      setSettingsOpen(false);
    }
  }, [status]);

  const completedTurns = dialogue.turns.slice(
    0,
    status === "complete" ? dialogue.turns.length : turnIndex,
  );

  const restart = () => {
    resetRecognition();
    setTurnIndex(0);
    setResponsePlan(createResponsePlan(dialogue));
    setBestAttempts({});
    setCompletedAttempts({});
    setCurrentAttempt(null);
    setRecognitionError("");
    setSettingsOpen(false);
    setStatus("idle");
  };

  const retry = () => {
    resetRecognition();
    setCurrentAttempt(null);
    setRecognitionError("");
    setStatus("bot-speaking");
  };

  const replayBotTurn = () => {
    resetRecognition();
    setCurrentAttempt(null);
    setRecognitionError("");
    setStatus("bot-speaking");
  };

  const playSelectedResponse = () => {
    const shouldResumePractice = status !== "idle";

    resetRecognition();
    setCurrentAttempt(null);
    setRecognitionError("");
    setStatus("example-speaking");

    const finishExample = () => {
      if (shouldResumePractice) {
        beginRecognition();
      } else {
        setStatus("idle");
      }
    };

    speak(selectedResponse.text, {
      onEnd: finishExample,
      onError: finishExample,
      rate: speechRate,
    });
  };

  const advance = () => {
    const bestAttempt = bestAttempts[turn.id];

    if (!bestAttempt || bestAttempt.score === 0) {
      retry();
      return;
    }

    setCompletedAttempts((attempts) => ({
      ...attempts,
      [turn.id]: bestAttempt,
    }));
    resetRecognition();
    setCurrentAttempt(null);

    if (turnIndex === dialogue.turns.length - 1) {
      setSettingsOpen(false);
      setStatus("complete");
      return;
    }

    const nextTurnIndex = turnIndex + 1;
    setTurnIndex(nextTurnIndex);
    setStatus("bot-speaking");
  };

  useEffect(() => {
    if (status !== "result" || !currentAttempt) return;

    const timer = window.setTimeout(() => {
      if (currentAttempt.score === 0) {
        retry();
        return;
      }

      advance();
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [currentAttempt, status]);

  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col px-4 pt-6 md:px-5 md:pt-10",
        settingsOpen ? "pb-64" : "pb-40 md:pb-36",
      )}
    >
      <header className="flex items-center gap-4 border-b-2 border-ink/15 pb-5">
        <Link
          to="/dialogos"
          className="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-card shadow-[2px_2px_0_var(--ink)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          aria-label="Voltar aos diálogos"
        >
          <ArrowLeft className="size-5" strokeWidth={3} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black md:text-2xl">
            {dialogue.title}
          </h1>
          {status !== "idle" && (
            <p className="text-sm font-bold text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-500">
              {status === "complete"
                ? "Diálogo concluído"
                : `Fala ${turnIndex + 1} de ${dialogue.turns.length}`}
            </p>
          )}
        </div>
        <span className="rounded-full border-2 border-ink bg-accent px-3 py-1 text-xs font-black">
          {dialogue.level.toUpperCase()}
        </span>
      </header>

      {status !== "idle" && (
        <div className="mt-4 h-2 overflow-hidden rounded-full border border-ink bg-muted motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-500">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{
              width: `${((status === "complete" ? dialogue.turns.length : turnIndex) / dialogue.turns.length) * 100}%`,
            }}
          />
        </div>
      )}

      <div className="mt-7 flex flex-col gap-4" aria-live="polite">
        {completedTurns.map((completedTurn) => {
          const attempt = completedAttempts[completedTurn.id];
          const response =
            completedTurn.responses.find(
              (option) => option?.id === attempt?.responseId,
            ) ?? completedTurn.responses[0];

          return (
            <div key={completedTurn.id} className="space-y-3 opacity-75">
              <ConversationLine
                speaker={dialogue.botCharacter}
                line={completedTurn.bot}
                type="bot"
                translationVisible={translationsVisible}
                completed
                replayDisabled={status !== "complete"}
                onReplay={() => speak(completedTurn.bot.text, { rate: speechRate })}
              />
              <ConversationLine
                speaker="Você"
                line={response}
                type="user"
                translationVisible={translationsVisible}
                completed
                score={attempt?.score}
              />
            </div>
          );
        })}

        {status !== "complete" && status !== "idle" && (
          <div className="space-y-4">
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
              <ConversationLine
                speaker={dialogue.botCharacter}
                line={turn.bot}
                type="bot"
                translationVisible={translationsVisible}
                active={status === "bot-speaking"}
                replayDisabled={
                  status === "bot-speaking" ||
                  status === "example-speaking" ||
                  status === "requesting-microphone" ||
                  status === "listening"
                }
                onReplay={replayBotTurn}
              />
            </div>

            {status !== "bot-speaking" && (
              <div className="relative ml-auto w-[92%] max-w-xl rounded-xl border-2 border-ink bg-secondary/25 p-4 shadow-[3px_3px_0_var(--ink)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 md:p-5">
              <button
                type="button"
                className="absolute top-3 right-3 grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 md:top-4 md:right-4"
                onClick={playSelectedResponse}
                disabled={
                  status === "example-speaking" ||
                  status === "requesting-microphone" ||
                  status === "result"
                }
                aria-label="Ouvir esta resposta"
              >
                <Volume2 className="size-4" />
              </button>

              <SpokenLine
                key={selectedResponse.id}
                line={selectedResponse}
                transcript={transcript}
                translationVisible={translationsVisible}
                tracking={
                  status === "requesting-microphone" || status === "listening"
                }
              />
              </div>
            )}
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

        <div
          ref={conversationEndRef}
          className={cn(settingsOpen ? "scroll-mb-64" : "scroll-mb-40 md:scroll-mb-36")}
        />
      </div>

      <MicrophoneDock
        status={status}
        currentScore={currentAttempt?.score}
        recognitionError={recognitionError}
        translationsVisible={translationsVisible}
        settingsOpen={settingsOpen}
        speechRate={speechRate}
        onSettingsOpenChange={setSettingsOpen}
        onSpeechRateChange={setSpeechRate}
        onToggleTranslations={() =>
          setTranslationsVisible((visible) => !visible)
        }
        onStart={startPractice}
        onRetry={retry}
        onRestart={restart}
        onStop={stopRecognition}
      />
    </section>
  );
}

type ConversationLineProps = {
  speaker: string;
  line: DialogueLine;
  type: "bot" | "user";
  translationVisible: boolean;
  active?: boolean;
  completed?: boolean;
  score?: number;
  replayDisabled?: boolean;
  onReplay?: () => void;
};

function ConversationLine({
  speaker,
  line,
  type,
  translationVisible,
  active,
  completed,
  score,
  replayDisabled,
  onReplay,
}: ConversationLineProps) {
  return (
    <div
      className={cn(
        "flex max-w-xl items-start gap-2.5",
        type === "user" && "ml-auto flex-row-reverse",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink",
          type === "bot" ? "bg-accent" : "bg-secondary",
        )}
      >
        {type === "bot" ? (
          <Bot className="size-4" />
        ) : (
          <UserRound className="size-4" />
        )}
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
            <p className="text-[0.68rem] font-black tracking-wide text-muted-foreground uppercase">
              {speaker}
            </p>
            {completed && (
              <Check className="size-3.5 text-primary" strokeWidth={3} />
            )}
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
        <TranslatableLine
          line={line}
          className="mt-1"
          translationVisible={translationVisible}
        />
      </div>
    </div>
  );
}

type TranslatableLineProps = {
  line: DialogueLine;
  className?: string;
  translationVisible: boolean;
};

function TranslatableLine({ line, className, translationVisible }: TranslatableLineProps) {
  return (
    <div className={className}>
      <p className="text-base leading-6 font-extrabold md:text-lg">
        {line.text}
      </p>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin,transform] duration-300 ease-out motion-reduce:transition-none",
          translationVisible
            ? "mt-1.5 translate-y-0 grid-rows-[1fr] opacity-100"
            : "mt-0 -translate-y-1 grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!translationVisible}
      >
        <p className="overflow-hidden text-sm leading-5 font-semibold text-muted-foreground">
          {line.translation}
        </p>
      </div>
    </div>
  );
}

function normalizeSpokenWord(word: string) {
  return word
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findSpokenWordIndexes(expectedText: string, transcript: string) {
  const expectedWords = Array.from(
    expectedText.matchAll(/[\p{L}\p{N}']+/gu),
    (match) => normalizeSpokenWord(match[0]),
  );
  const spokenWords = Array.from(
    transcript.matchAll(/[\p{L}\p{N}']+/gu),
    (match) => normalizeSpokenWord(match[0]),
  );
  const spokenIndexes = new Set<number>();
  let nextExpectedIndex = 0;

  for (const spokenWord of spokenWords) {
    const matchedIndex = expectedWords.indexOf(spokenWord, nextExpectedIndex);

    if (matchedIndex !== -1) {
      spokenIndexes.add(matchedIndex);
      nextExpectedIndex = matchedIndex + 1;
    }
  }

  return spokenIndexes;
}

type SpokenLineProps = {
  line: DialogueLine;
  transcript: string;
  tracking: boolean;
  translationVisible: boolean;
};

function SpokenLine({ line, transcript, tracking, translationVisible }: SpokenLineProps) {
  const spokenWordIndexes = findSpokenWordIndexes(line.text, transcript);
  const parts = Array.from(
    line.text.matchAll(/[\p{L}\p{N}']+|[^\p{L}\p{N}']+/gu),
    (match) => match[0],
  );
  let wordIndex = 0;

  return (
    <div className="pt-5 text-center">
      <p
        className="mx-auto max-w-lg px-8 text-xl leading-8 font-black md:text-2xl md:leading-9"
        aria-label={line.text}
      >
        {parts.map((part, partIndex) => {
          const isWord = /[\p{L}\p{N}']/u.test(part);
          const currentWordIndex = isWord ? wordIndex++ : -1;

          return (
            <span
              key={`${partIndex}-${part}`}
              aria-hidden="true"
              className={cn(
                "transition-colors duration-200",
                tracking && isWord && "text-muted-foreground/45",
                tracking &&
                  isWord &&
                  spokenWordIndexes.has(currentWordIndex) &&
                  "rounded bg-primary/15 text-primary",
              )}
            >
              {part}
            </span>
          );
        })}
      </p>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin,transform] duration-300 ease-out motion-reduce:transition-none",
          translationVisible
            ? "mt-2 translate-y-0 grid-rows-[1fr] opacity-100"
            : "mt-0 -translate-y-1 grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!translationVisible}
      >
        <p className="overflow-hidden text-sm leading-5 font-semibold text-muted-foreground">
          {line.translation}
        </p>
      </div>
    </div>
  );
}

type MicrophoneDockProps = {
  status: PracticeStatus;
  currentScore?: number;
  recognitionError: string;
  translationsVisible: boolean;
  settingsOpen: boolean;
  speechRate: number;
  onToggleTranslations: () => void;
  onSettingsOpenChange: (open: boolean) => void;
  onSpeechRateChange: (rate: number) => void;
  onRetry: () => void;
  onStart: () => void;
  onRestart: () => void;
  onStop: () => void;
};

const statusContent = {
  idle: {
    eyebrow: "PRONTO PARA COMEÇAR",
    description: "Toque no microfone para iniciar o diálogo.",
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
    eyebrow: "GRAVANDO",
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
} satisfies Record<PracticeStatus, { eyebrow: string; description: string }>;

const speechRateOptions = [
  { label: "Devagar", value: 0.75 },
  { label: "Normal", value: 0.92 },
  { label: "Rápido", value: 1.1 },
];

function MicrophoneDock({
  status,
  currentScore,
  recognitionError,
  translationsVisible,
  settingsOpen,
  speechRate,
  onToggleTranslations,
  onSettingsOpenChange,
  onSpeechRateChange,
  onRetry,
  onStart,
  onRestart,
  onStop,
}: MicrophoneDockProps) {
  const settingsPanelHasOpenedRef = useRef(false);
  const content = statusContent[status];
  const description =
    status === "recognition-error" && recognitionError
      ? recognitionError
      : content.description;
  const isWaitingToStart = status === "idle";
  const settingsPanelVisible =
    settingsOpen && !isWaitingToStart && status !== "complete";

  useEffect(() => {
    if (settingsPanelVisible) settingsPanelHasOpenedRef.current = true;
  }, [settingsPanelVisible]);

  return (
    <aside
      className={cn(
        "fixed left-1/2 z-30 w-[calc(100%-2rem)] -translate-x-1/2 transition-[bottom,max-width,transform] duration-700 ease-in-out md:w-[calc(100%-2.5rem)]",
        isWaitingToStart
          ? "bottom-1/2 max-w-72 translate-y-1/2"
          : "bottom-3 max-w-3xl translate-y-0",
      )}
    >
      <div
        className={cn(
          "absolute bottom-[calc(100%+0.5rem)] left-0 z-0 w-full rounded-2xl border-2 border-ink bg-card/95 p-3 shadow-[4px_4px_0_var(--ink)] backdrop-blur",
          settingsPanelVisible
            ? "settings-panel-enter"
            : settingsPanelHasOpenedRef.current
              ? "settings-panel-exit pointer-events-none"
              : "translate-y-full opacity-0 pointer-events-none",
        )}
        aria-label="Configurações de voz"
        aria-hidden={!settingsPanelVisible}
      >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs font-black tracking-wide text-primary uppercase">
                Velocidade da voz
              </p>
              <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                Ajuste o ritmo do bot e dos exemplos.
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-1 rounded-xl bg-muted p-1">
              {speechRateOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "cursor-pointer rounded-lg px-2.5 py-2 text-xs font-black transition-colors",
                    speechRate === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                  onClick={() => onSpeechRateChange(option.value)}
                  aria-pressed={speechRate === option.value}
                  tabIndex={settingsPanelVisible ? 0 : -1}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
      </div>

      <div
        className={cn(
          "relative z-10 w-full border-2 border-ink bg-card/95 shadow-[4px_4px_0_var(--ink)] backdrop-blur transition-[min-height,border-radius,padding] duration-700 ease-in-out",
          isWaitingToStart
            ? "min-h-72 rounded-3xl px-7 py-7"
            : "min-h-0 rounded-2xl px-4 py-3",
        )}
      >
        <div
          className={cn(
            "flex gap-3 md:gap-4",
            isWaitingToStart
              ? "flex-col items-center justify-center text-center"
              : "items-center",
          )}
        >
          <div
            className={cn("min-w-0 flex-1", isWaitingToStart && "w-full flex-none")}
            aria-live="polite"
          >
            <p className="text-xs font-black tracking-wide text-primary">
              {content.eyebrow}
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-bold text-muted-foreground",
                isWaitingToStart ? "whitespace-normal" : "truncate",
              )}
            >
              {description}
            </p>
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center gap-2",
              isWaitingToStart && "mt-8",
            )}
          >
            {!isWaitingToStart && (
              <button
              type="button"
              className={cn(
                "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-0 text-xs font-black transition-colors sm:w-auto sm:px-2",
                translationsVisible
                  ? "bg-secondary/60 text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={onToggleTranslations}
              aria-pressed={translationsVisible}
              aria-label={
                translationsVisible
                  ? "Ocultar todas as traduções"
                  : "Mostrar todas as traduções"
              }
              title={translationsVisible ? "Ocultar traduções" : "Mostrar traduções"}
            >
              <Languages className="size-4" />
              <span className="hidden sm:inline">
                {translationsVisible ? "Ocultar" : "Traduzir"}
              </span>
              </button>
            )}

            {!isWaitingToStart && status !== "complete" && (
              <button
                type="button"
                className={cn(
                  "grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  settingsOpen && "bg-muted text-foreground",
                )}
                onClick={() => onSettingsOpenChange(!settingsOpen)}
                aria-expanded={settingsOpen}
                aria-label={settingsOpen ? "Fechar configurações" : "Abrir configurações"}
                title={settingsOpen ? "Fechar configurações" : "Configurações"}
              >
                <Settings2 className="size-4" />
              </button>
            )}

          {status === "complete" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRestart}
            >
              <RotateCcw className="size-4" />
              Refazer
            </Button>
          ) : status === "result" ? (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border-2 border-ink bg-accent px-3 py-2 text-sm font-black">
              <LoaderCircle className="size-4 animate-spin" />
              {(currentScore ?? 0) === 0 ? "Nova tentativa" : "Avançando"}
            </span>
          ) : status === "recognition-error" ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="sm:size-16 sm:rounded-full"
              onClick={onRetry}
              aria-label="Tentar novamente"
              title="Tentar novamente"
            >
              <RotateCcw className="size-5 sm:size-6" strokeWidth={2.8} />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              className={cn(
                "size-12 shrink-0 rounded-full p-0 shadow-[4px_4px_0_var(--ink)] sm:size-16",
                status === "listening" &&
                  "motion-safe:animate-pulse ring-4 ring-primary/25",
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
              onClick={status === "idle" ? onStart : onStop}
              aria-label={
                status === "idle" ? "Iniciar diálogo" : "Encerrar resposta"
              }
            >
              {status === "idle" && (
                <Mic className="size-5 sm:size-7" strokeWidth={2.8} />
              )}
              {status === "bot-speaking" && (
                <Volume2 className="size-5 sm:size-7" strokeWidth={2.8} />
              )}
              {status === "example-speaking" && (
                <Volume2 className="size-5 sm:size-7" strokeWidth={2.8} />
              )}
              {status === "requesting-microphone" && (
                <LoaderCircle
                  className="size-5 animate-spin sm:size-7"
                  strokeWidth={2.8}
                />
              )}
              {status === "listening" && (
                <Square className="size-5 fill-current sm:size-6" strokeWidth={2.8} />
              )}
            </Button>
          )}
          </div>
        </div>

      </div>
    </aside>
  );
}
