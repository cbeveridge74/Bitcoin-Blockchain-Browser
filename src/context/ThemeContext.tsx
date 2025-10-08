import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }

const THEME_KEY = 'btc-browser:theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const getInitial = (): Theme => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null
      if (raw === 'dark' || raw === 'light') return raw
    } catch (e) {}

    // OS preference fallback
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
      }
    } catch (e) {}

    return 'light'
  }

  const [theme, setThemeState] = useState<Theme>(getInitial)

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (theme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
      if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, theme)
    } catch (e) {}
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)
  const toggle = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext
