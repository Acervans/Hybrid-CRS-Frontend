'use client'

import { Menu, ActionIcon, Tooltip } from '@mantine/core'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { availableLanguages } from '@/constants'

import 'flag-icons/css/flag-icons.min.css'
import { useContext } from 'react'
import { LocaleContext } from '@/contexts/localeContext'

const localeToIcon: Record<string, string> = {
  en: 'gb',
  zh: 'cn'
}

export default function LanguageSelector() {
  const { locale, setLocale } = useContext(LocaleContext)
  const router = useRouter()
  const t = useTranslations('Locale')

  const getLocaleIcon = (localeCode: string) => localeToIcon[localeCode] || localeCode

  return (
    <Menu position='bottom' withArrow>
      <Menu.Target>
        <Tooltip label={t('tooltip')} position='left' openDelay={1000} withArrow>
          <ActionIcon variant='subtle'>
            <span className={`fi fi-${getLocaleIcon(locale)}`} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.keys(availableLanguages).map(code => {
          return (
            <Menu.Item
              key={code}
              onClick={() => {
                setLocale(code as Locale, { expires: 400, sameSite: 'lax' })
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
