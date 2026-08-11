import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "en-speak-theme"
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)"

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function getInitialTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    return isTheme(storedTheme) ? storedTheme : "system"
  } catch {
    return "system"
  }
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia(DARK_MEDIA_QUERY).matches)
  const resolvedTheme = isDark ? "dark" : "light"

  document.documentElement.dataset.theme = resolvedTheme
  document.documentElement.style.colorScheme = resolvedTheme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark ? "#171721" : "#fcf8ee")
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY)
    const handleSystemThemeChange = () => applyTheme("system")

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // The selected theme still works when storage is unavailable.
    }
    applyTheme(theme)

    if (theme === "system") {
      mediaQuery.addEventListener("change", handleSystemThemeChange)
    }

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

export type { Theme }
