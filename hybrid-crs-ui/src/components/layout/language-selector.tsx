'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { availableLanguages } from '@/constants'

import { useContext } from 'react'
import { LocaleContext } from '@/contexts/localeContext'
import { Globe } from 'lucide-react'

export default function LanguageSelector() {
  const { locale, setLocale } = useContext(LocaleContext)
  const router = useRouter()
  const t = useTranslations('Locale')

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <DropdownMenuTrigger asChild>
              <div className='flex flex-row gap-1 items-center justify-center w-11'>
                <Globe size={16} />
                {locale.toUpperCase()}
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t('tooltip')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.keys(availableLanguages).map(code => {
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => {
                setLocale(code as Locale, { expires: 400, sameSite: 'lax' })
                router.refresh()
              }}
              className='justify-between'
            >
              <span>{availableLanguages[code as Locale]}</span>
              <span>{code.toUpperCase()}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
