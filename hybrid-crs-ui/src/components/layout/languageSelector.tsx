'use client'

import { Menu, ActionIcon } from '@mantine/core'

import { useCookie } from 'react-use'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

import { availableLanguages } from '@/constants'

import 'flag-icons/css/flag-icons.min.css'

const localeToIcon: Record<string, string> = {
  en: 'gb',
  zh: 'cn'
}

export default function LanguageSelector() {
  const [locale, setLocale] = useCookie('NEXT_LOCALE')
  const defaultLocale = useLocale()
  const router = useRouter()
  const t = useTranslations('Locale')

  const getLocaleIcon = (localeCode: string) => localeToIcon[localeCode] || localeCode

  return (
    <Menu position='bottom' withArrow>
      <Menu.Target>
        <ActionIcon variant='subtle' title={t('tooltip')}>
          <span className={`fi fi-${getLocaleIcon(locale || defaultLocale)}`} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.keys(availableLanguages).map(code => {
          return (
            <Menu.Item
              key={code}
              onClick={() => {
                setLocale(code as Locale, { expires: 34560000, sameSite: 'lax' })
                router.refresh()
              }}
              leftSection={<span className={`fi fi-${getLocaleIcon(code)}`} />}
            >
              {availableLanguages[code as Locale]}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
