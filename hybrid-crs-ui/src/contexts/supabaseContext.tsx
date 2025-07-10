'use client'

import { useRouter } from 'next/navigation'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useCallback, useMemo, useState } from 'react'

import { SupabaseClient, UserResponse } from '@supabase/supabase-js'
import { useEffectOnce } from 'react-use'

import { createClient } from '@/lib/supabase/client'

interface SupabaseContextType {
  auth: UserResponse | undefined
  setAuth: Dispatch<SetStateAction<UserResponse | undefined>>
  // TODO remove after fix
  // eslint-disable-next-line
  supabase: SupabaseClient<any, any, any>
  handleLogin: (redirectTo?: string) => Promise<void>
  refreshAuth: () => Promise<UserResponse | void>
  getAccessToken: () => Promise<string | undefined>
}

export const SupabaseContext = createContext<SupabaseContextType>({
  auth: undefined,
  setAuth: () => {},
  supabase: createClient(),
  handleLogin: async () => {},
  refreshAuth: async () => {},
  getAccessToken: async () => undefined
})

// SupabaseProvider component to provide auth configuration, supabase client
export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<UserResponse | undefined>()
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const refreshAuth = useCallback(async () => {
    const authRes = await supabase.auth.getUser()

    setAuth(authRes)
    return authRes
  }, [supabase])

  const handleLogin = useCallback(
    async (redirectTo?: string) => {
      const authRes = await refreshAuth()
      if (authRes.data.user) router.push(redirectTo || '/')
    },
    [refreshAuth, router]
  )

  const getAccessToken = useCallback(async () => {
    return (await supabase.auth.getSession()).data.session?.access_token
  }, [supabase])

  useEffectOnce(() => {
    refreshAuth()
  })

  const contextValue = useMemo(
    () => ({
      auth,
      setAuth,
      supabase,
      handleLogin,
      refreshAuth,
      getAccessToken
    }),
    [auth, handleLogin, refreshAuth, getAccessToken, supabase]
  )

  return <SupabaseContext.Provider value={contextValue}>{children}</SupabaseContext.Provider>
}
