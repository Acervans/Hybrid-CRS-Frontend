'use client'

import { Menu, ActionIcon } from '@mantine/core'

import { useCookie } from 'react-use'
import { useTranslations } from 'next-intl'

import 'flag-icons/css/flag-icons.min.css'
import { useRouter } from 'next/navigation'

export default function LanguageSelector() {
  const [locale, setLocale] = useCookie('NEXT_LOCALE')
  const t = useTranslations('Locale')
  const router = useRouter()

  const availableLanguages = {
    gb: 'English (UK)',
    es: 'Español',
    de: 'Deutsch',
    fr: 'Français',
    it: 'Italiano',
    pt: 'Português',
    cn: '中文'
  }

  return (
    <Menu position='bottom' withArrow>
      <Menu.Target>
        <ActionIcon variant='subtle' title={t('tooltip')}>
          <span className={`fi fi-${locale || 'gb'}`} />
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
              leftSection={<span className={`fi fi-${code}`} />}
            >
              {availableLanguages[code as Locale]}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
