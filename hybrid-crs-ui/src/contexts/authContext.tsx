'use client'

import { useRouter } from 'next/navigation'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useState } from 'react'

import { UserResponse } from '@supabase/supabase-js'
import { useEffectOnce } from 'react-use'

import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  auth: UserResponse | undefined
  setAuth: Dispatch<SetStateAction<UserResponse | undefined>>
  supabase: ReturnType<typeof createClient>
  handleLogin: (redirectTo?: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  auth: undefined,
  setAuth: () => {},
  supabase: createClient(),
  handleLogin: async () => {}
})

// AuthProvider component to provide auth and session configuration
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<UserResponse | undefined>()
  const supabase = createClient()
  const router = useRouter()

  const refreshAuth = async () => {
    return supabase.auth.getUser().then(authRes => {
      setAuth(authRes)
      return authRes
    })
  }

  const handleLogin = async (redirectTo?: string) => {
    refreshAuth().then(authRes => {
      if (authRes.data.user) router.push(redirectTo || '/')
    })
  }

  useEffectOnce(() => {
    refreshAuth()
  })

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        supabase,
        handleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
