import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import deepmerge from 'deepmerge'

export default getRequestConfig(async () => {
  const reqCookies = await cookies()
  const locale = reqCookies.get('NEXT_LOCALE')?.value || 'gb'

  // Fallback to english
  const userMessages = (await import(`../../messages/${locale}.json`)).default
  const defaultMessages = (await import(`../../messages/gb.json`)).default
  const messages = locale === 'gb' ? userMessages : deepmerge(defaultMessages, userMessages)

  return {
    locale,
    messages
  }
})
