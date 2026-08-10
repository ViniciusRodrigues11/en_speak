import { useCallback, useEffect, useRef } from "react"

type SpeakOptions = {
  onEnd?: () => void
  onError?: () => void
}

export function useSpeechSynthesis() {
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window

  const cancel = useCallback(() => {
    const utterance = activeUtteranceRef.current

    if (utterance) {
      utterance.onend = null
      utterance.onerror = null
      activeUtteranceRef.current = null
    }

    if (isSupported) {
      window.speechSynthesis.cancel()
    }
  }, [isSupported])

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!isSupported) {
        options.onError?.()
        return () => undefined
      }

      cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice =
        voices.find((voice) => voice.lang.toLowerCase() === "en-us") ??
        voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))

      utterance.lang = "en-US"
      utterance.rate = 0.92
      utterance.pitch = 1

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onend = () => {
        if (activeUtteranceRef.current !== utterance) return
        activeUtteranceRef.current = null
        options.onEnd?.()
      }

      utterance.onerror = () => {
        if (activeUtteranceRef.current !== utterance) return
        activeUtteranceRef.current = null
        options.onError?.()
      }

      activeUtteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)

      return () => {
        if (activeUtteranceRef.current === utterance) {
          cancel()
        }
      }
    },
    [cancel, isSupported],
  )

  useEffect(() => cancel, [cancel])

  return { cancel, isSupported, speak }
}
