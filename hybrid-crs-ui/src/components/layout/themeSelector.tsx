'use client'

import { Menu, ActionIcon, useMantineColorScheme } from '@mantine/core'

import Icon from '@mdi/react'
import { mdiWhiteBalanceSunny, mdiWeatherNight, mdiThemeLightDark } from '@mdi/js'

const themeItemProps = {
  dark: {
    name: 'Dark',
    icon: mdiWeatherNight,
    color: 'blue'
  },
  light: {
    name: 'Light',
    icon: mdiWhiteBalanceSunny,
    color: 'yellow'
  },
  auto: {
    name: 'System',
    icon: mdiThemeLightDark,
    color: 'lightseagreen'
  }
}

export default function ThemeSelector() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  return (
    <Menu position='bottom' withArrow>
      <Menu.Target>
        <ActionIcon variant='subtle' color={themeItemProps[colorScheme].color} title='Set Theme'>
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
