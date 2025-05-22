'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import React from 'react'

import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffectOnce } from 'react-use'

import LanguageSelector from '@/components/layout/language-selector'
import { LlmSelector, LlmSelectorDisabled } from '@/components/layout/llm-selector'
import ThemeSelector from '@/components/layout/theme-selector'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'

const excludePaths: Set<string> = new Set<string>(['chats'])

export function AppHeader(props: { authenticated: boolean }) {
  const { authenticated } = props
  const { toggleSidebar } = useSidebar()

  const [loaded, setLoaded] = useState<boolean>(false)
  const t = useTranslations('Titles')

  const path = usePathname()
  const pathNames = path.split('/').filter(path => path)
  const isMobile = useIsMobile()

  useEffectOnce(() => {
    setLoaded(true)
  })

  return (
    <header
      className={`flex sticky top-0 z-50 h-12 md:h-16 bg-background/30 backdrop-blur-md shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12`}
    >
      <div className='flex w-full justify-between gap-2 px-4'>
        <div className='flex items-center'>
          <Button className='h-8 w-8' variant='ghost' size='icon' onClick={toggleSidebar}>
            <Menu className='!size-[1.5rem]' />
          </Button>
          <Separator orientation='vertical' className='ml-2 mr-3 !h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Image src='/icons/icon-96x96.png' alt='logo' width={18} height={18} hidden={!isMobile} />
                <BreadcrumbLink asChild className='font-semibold text-primary'>
                  <Link href={'/'}>HybridCRS</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {loaded && pathNames.length > 0 && !isMobile && (
                <>
                  <BreadcrumbSeparator />
                  {pathNames.map((link, index) => {
                    const href = `/${pathNames.slice(0, index + 1).join('/')}`
                    const isLast = path === href
                    const title = t(link)

                    return (
                      <React.Fragment key={link}>
                        <BreadcrumbItem className='capitalize'>
                          {!isLast && !excludePaths.has(link) ? (
                            <BreadcrumbLink asChild>
                              <Link href={href}>{title}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                      </React.Fragment>
                    )
                  })}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className='flex gap-4 items-center'>
          {loaded ? (
            <>
              {authenticated ? <LlmSelector /> : <LlmSelectorDisabled />}
              <LanguageSelector />
              <ThemeSelector />
            </>
          ) : (
            <>
              <Skeleton className='h-[1.5rem] w-[1.5rem]' />
              <Skeleton className='h-[1.5rem] w-11' />
              <Skeleton className='h-[1.5rem] w-[1.5rem]' />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
