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

import { Sun, Moon, SunMoon } from 'lucide-react'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('Theme')

  const themeItemProps = {
    dark: {
      name: t('dark'),
      icon: Moon,
      color: 'lightskyblue'
    },
    light: {
      name: t('light'),
      icon: Sun,
      color: 'orange'
    },
    system: {
      name: t('system'),
      icon: SunMoon,
      color: 'lightseagreen'
    }
  }

  const currTheme = themeItemProps[theme as Theme]

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <DropdownMenuTrigger asChild className='w-[1.5rem]'>
              <currTheme.icon color={currTheme.color} />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent className='min-w-none'>
        <DropdownMenuLabel>{t('tooltip')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.keys(themeItemProps).map(theme => {
          const themeProps = themeItemProps[theme as Theme]

          return (
            <DropdownMenuItem key={theme} onClick={() => setTheme(theme as Theme)}>
              <themeProps.icon size='1rem' />
              {themeProps.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
