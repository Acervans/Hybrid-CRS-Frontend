'use client'

import { useState } from 'react'
import { useEffectOnce } from 'react-use'

import { Flex, Title } from '@mantine/core'
import { useHeadroom } from '@mantine/hooks'

import { AppShell, Burger, Group, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Image from 'next/image'
import Link from 'next/link'
import ThemeSelector from '@/components/layout/themeSelector'

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

  const [loaded, setLoaded] = useState<boolean>(false)
  const pinned = useHeadroom({ fixedAt: 120 })

  useEffectOnce(() => {
    setLoaded(true)
  })

  return (
    <AppShell
      layout='default'
      header={{ height: { base: 60, md: 70 }, collapsed: !pinned }}
      navbar={{
        width: { base: 200, md: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
      }}
      padding='xs'
      withBorder={false}
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
          <Group>{loaded && <ThemeSelector />}</Group>
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
      <AppShell.Main h='100dvh' className='!pt-[var(--app-shell-header-offset)]'>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
