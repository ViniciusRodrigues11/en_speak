import { useCallback, useEffect, useRef, useState } from "react"

type RecognitionAlternativeLike = {
  confidence: number
  transcript: string
}

type RecognitionResultLike = {
  readonly isFinal: boolean
  readonly length: number
  readonly [index: number]: RecognitionAlternativeLike
}

type RecognitionResultListLike = {
  readonly length: number
  readonly [index: number]: RecognitionResultLike
}

type RecognitionEventLike = Event & {
  readonly results: RecognitionResultListLike
}

type RecognitionErrorEventLike = Event & {
  readonly error: string
  readonly message?: string
}

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onend: (() => void) | null
  onerror: ((event: RecognitionErrorEventLike) => void) | null
  onresult: ((event: RecognitionEventLike) => void) | null
  onspeechend: (() => void) | null
  onstart: (() => void) | null
  abort: () => void
  start: () => void
  stop: () => void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

type RecognitionResult = {
  transcript: string
  confidence: number
}

type UseSpeechRecognitionOptions = {
  lang?: string
  onError?: (message: string) => void
  onResult?: (result: RecognitionResult) => void
  onStart?: () => void
}

type ActiveRecognition = {
  instance: BrowserSpeechRecognition
  cancel: () => void
}

function getRecognitionConstructor(): BrowserSpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined

  const speechWindow = window as typeof window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

function getErrorMessage(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Permita o acesso ao microfone para continuar."
    case "audio-capture":
      return "Não foi possível acessar um microfone."
    case "network":
      return "O serviço de reconhecimento de voz está indisponível."
    case "no-speech":
      return "Não detectamos nenhuma fala. Tente novamente."
    case "language-not-supported":
      return "O reconhecimento em inglês não está disponível neste navegador."
    default:
      return "Não foi possível reconhecer sua fala. Tente novamente."
  }
}

export function useSpeechRecognition({
  lang = "en-US",
  onError,
  onResult,
  onStart,
}: UseSpeechRecognitionOptions = {}) {
  const callbacksRef = useRef({ onError, onResult, onStart })
  const activeRecognitionRef = useRef<ActiveRecognition | null>(null)
  const requestIdRef = useRef(0)
  const [transcript, setTranscript] = useState("")
  const RecognitionConstructor = getRecognitionConstructor()
  const isSupported = Boolean(RecognitionConstructor)

  useEffect(() => {
    callbacksRef.current = { onError, onResult, onStart }
  }, [onError, onResult, onStart])

  const abort = useCallback(() => {
    requestIdRef.current += 1
    activeRecognitionRef.current?.cancel()
    activeRecognitionRef.current = null
  }, [])

  const reset = useCallback(() => {
    abort()
    setTranscript("")
  }, [abort])

  const stop = useCallback(() => {
    activeRecognitionRef.current?.instance.stop()
  }, [])

  const start = useCallback(async () => {
    abort()
    setTranscript("")

    const Constructor = getRecognitionConstructor()

    if (!Constructor) {
      callbacksRef.current.onError?.("O reconhecimento de voz não é compatível com este navegador.")
      return
    }

    const requestId = requestIdRef.current

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("media-devices-unavailable")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      stream.getTracks().forEach((track) => track.stop())

      if (requestId !== requestIdRef.current) return

      const recognition = new Constructor()
      let cancelled = false
      let failed = false
      let latestTranscript = ""
      let latestConfidence = 0

      const cancel = () => {
        cancelled = true
        recognition.onstart = null
        recognition.onresult = null
        recognition.onerror = null
        recognition.onspeechend = null
        recognition.onend = null
        recognition.abort()
      }

      activeRecognitionRef.current = { instance: recognition, cancel }
      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        if (!cancelled) callbacksRef.current.onStart?.()
      }

      recognition.onresult = (event) => {
        const finalParts: string[] = []
        const interimParts: string[] = []

        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index]
          const alternative = result[0]

          if (!alternative) continue

          if (result.isFinal) {
            finalParts.push(alternative.transcript)
            latestConfidence = alternative.confidence
          } else {
            interimParts.push(alternative.transcript)
          }
        }

        latestTranscript = [...finalParts, ...interimParts].join(" ").trim()
        setTranscript(latestTranscript)
      }

      recognition.onerror = (event) => {
        if (cancelled || event.error === "aborted") return
        failed = true
        callbacksRef.current.onError?.(getErrorMessage(event.error))
      }

      recognition.onspeechend = () => {
        if (!cancelled) recognition.stop()
      }

      recognition.onend = () => {
        if (cancelled) return
        activeRecognitionRef.current = null

        if (failed) return

        if (!latestTranscript) {
          callbacksRef.current.onError?.(getErrorMessage("no-speech"))
          return
        }

        callbacksRef.current.onResult?.({
          transcript: latestTranscript,
          confidence: latestConfidence,
        })
      }

      recognition.start()
    } catch (error) {
      if (requestId !== requestIdRef.current) return

      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? getErrorMessage("not-allowed")
          : "Não foi possível acessar o microfone. Verifique as permissões do navegador."

      callbacksRef.current.onError?.(message)
    }
  }, [abort, lang])

  useEffect(() => abort, [abort])

  return {
    abort,
    isSupported,
    reset,
    start,
    stop,
    transcript,
  }
}
