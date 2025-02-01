'use client'

import { Menu, ActionIcon, useMantineColorScheme } from '@mantine/core'

import Icon from '@mdi/react'
import { mdiWhiteBalanceSunny, mdiWeatherNight, mdiThemeLightDark } from '@mdi/js'
import { useTranslations } from 'next-intl'

export default function ThemeSelector() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const t = useTranslations('Theme')

  const themeItemProps = {
    dark: {
      name: t('dark'),
      icon: mdiWeatherNight,
      color: 'blue'
    },
    light: {
      name: t('light'),
      icon: mdiWhiteBalanceSunny,
      color: 'yellow'
    },
    auto: {
      name: t('system'),
      icon: mdiThemeLightDark,
      color: 'lightseagreen'
    }
  }

  return (
    <Menu position='bottom' withArrow>
      <Menu.Target>
        <ActionIcon variant='subtle' color={themeItemProps[colorScheme].color} title={t('tooltip')}>
          <Icon path={themeItemProps[colorScheme].icon} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.keys(themeItemProps).map(theme => {
          const themeProps = themeItemProps[theme as ColorScheme]

          return (
            <Menu.Item
              key={theme}
              onClick={() => setColorScheme(theme as ColorScheme)}
              leftSection={<Icon path={themeProps.icon} size='1rem' />}
            >
              {themeProps.name}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
