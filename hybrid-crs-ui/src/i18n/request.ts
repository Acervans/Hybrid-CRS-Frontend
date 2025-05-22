import { cookies, headers } from 'next/headers'

import deepmerge from 'deepmerge'
import { getRequestConfig } from 'next-intl/server'

import { availableLanguages } from '@/constants'

export default getRequestConfig(async () => {
  const reqCookies = await cookies()
  const reqHeaders = await headers()

  // Get locale from cookie or request headers
  const locale =
    reqCookies.get('NEXT_LOCALE')?.value || reqHeaders.get('accept-language')?.split(',')[1].split(';')[0] || 'en'

  const defaultMessages = (await import(`../../messages/en.json`)).default

  if (locale === 'en' || !availableLanguages[locale as Locale]) {
    return {
      locale: 'en',
      messages: defaultMessages
    }
  }

  // Fallback to english entries
  const userMessages = (await import(`../../messages/${locale}.json`)).default
  const messages = deepmerge(defaultMessages, userMessages)

  return {
    locale,
    messages
  }
})
