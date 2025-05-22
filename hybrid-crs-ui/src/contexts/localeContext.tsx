'use client'

import type { ReactNode } from 'react'
import { createContext } from 'react'

import { useLocale } from 'next-intl'
import { useCookie } from 'react-use'

interface LocaleContextType {
  locale: Locale
  setLocale: (newValue: string, options?: Cookies.CookieAttributes | undefined) => void
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {}
})

// LocaleProvider component to provide locale to all components
export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useCookie('NEXT_LOCALE')
  const defaultLocale = useLocale()

  return (
    <LocaleContext.Provider
      value={{
        locale: (locale || defaultLocale) as Locale,
        setLocale
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}
