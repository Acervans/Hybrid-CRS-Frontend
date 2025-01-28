'use client'

import { useState } from 'react'
import { useEffectOnce } from 'react-use'

import { ActionIcon, Flex, Title, useMantineColorScheme } from '@mantine/core'

import Icon from '@mdi/react'
import { mdiWeatherSunny, mdiWeatherNight } from '@mdi/js'

import { AppShell, Burger, Group, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

  const [loaded, setLoaded] = useState<boolean>(false)
  const { colorScheme, setColorScheme, toggleColorScheme } = useMantineColorScheme()

  useEffectOnce(() => {
    setLoaded(true)
    if (colorScheme === 'auto' && window.matchMedia) {
      setColorScheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
  })

  return (
    <AppShell
      layout='default'
      header={{ height: { base: 60, md: 70, lg: 70 } }}
      navbar={{
        width: { base: 200, md: 300, lg: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
      }}
      padding='md'
    >
      <AppShell.Header>
        <Flex justify={'space-between'} h='100%' px='md'>
          <Group>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom='sm' size='sm' />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom='sm' size='sm' />
            <Link href={'/'}>
              <Group>
                <Image src={'/icons/icon-512x512.png'} alt='Hybrid CRS Logo' width={45} height={45} />
                <Title mt={3} order={2}>
                  HybridCRS
                </Title>
              </Group>
            </Link>
          </Group>
          <Group>
            {loaded && (
              <ActionIcon
                variant='subtle'
                color={colorScheme === 'dark' ? 'yellow' : 'blue'}
                onClick={() => toggleColorScheme()}
                title={`${colorScheme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {colorScheme === 'dark' ? (
                  <Icon path={mdiWeatherSunny} size='1' />
                ) : (
                  <Icon path={mdiWeatherNight} size='1' />
                )}
              </ActionIcon>
            )}
          </Group>
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar p='md'>
        Navbar
        {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt='sm' animate={false} />
          ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
