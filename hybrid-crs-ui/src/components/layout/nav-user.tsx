'use client'

import { redirect } from 'next/navigation'
import { useContext } from 'react'

import { User } from '@supabase/supabase-js'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { AuthContext } from '@/contexts/authContext'
import { useToast } from '@/hooks/use-toast'

export function NavUser() {
  const t = useTranslations('Auth')
  const { isMobile } = useSidebar()
  const { toast } = useToast()
  const { auth, setAuth, supabase } = useContext(AuthContext)
  const user = auth?.data?.user as User

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error during Log out'
      })
    } else {
      setAuth(undefined)
      redirect('/login')
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={user?.user_metadata.picture} alt={user?.user_metadata.full_name} />
                <AvatarFallback className='rounded-lg'>{user?.user_metadata.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{user?.user_metadata.full_name}</span>
                <span className='truncate text-xs'>{user?.email}</span>
              </div>
              <LogOut className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user?.user_metadata.picture} alt={user?.user_metadata.full_name} />
                  <AvatarFallback className='rounded-lg'>{user?.user_metadata.full_name[0]}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user?.user_metadata.full_name}</span>
                  <span className='truncate text-xs'>{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
