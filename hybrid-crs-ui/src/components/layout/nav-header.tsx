'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

export function NavHeader() {
  return (
    <SidebarMenu className='group-data-[collapsible=icon]:mb-2'>
      <SidebarMenuItem>
        <Link href='/'>
          <SidebarMenuButton size='lg' className='hover:bg-inherit active:bg-inherit'>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <Image src='/icons/icon-256x256.png' width={45} height={45} alt='Logo' />
            </div>
            <div className='grid flex-1 text-left text-primary text-2xl leading-tight ml-2'>
              <span className='truncate font-semibold'>HybridCRS</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
