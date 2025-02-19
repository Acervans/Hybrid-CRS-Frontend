export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const availableLanguages: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  zh: '简体中文'
}
