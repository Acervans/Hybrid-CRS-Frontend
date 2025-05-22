'use server'

import { revalidatePath } from 'next/cache'

import { CredentialResponse } from 'google-one-tap'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const { error } = await supabase.auth.signInWithPassword(credentials)

  if (error) {
    return error.code
  }

  revalidatePath('/', 'layout')
}

export async function signup(formData: FormData, redirectTo: string | null) {
  const supabase = await createClient()
  const next = (redirectTo || '/') as string

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('username') as string
      },
      emailRedirectTo: next
    }
  }

  const { error, data } = await supabase.auth.signUp(credentials)

  // User already exists
  if (!error && data.user?.user_metadata?.email_verified === undefined) {
    return 'user_already_exists'
  }

  if (error) {
    return error.code
  }
}

export async function handleLoginWithGoogle(response: CredentialResponse) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.credential
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    return
  }

  revalidatePath('/', 'layout')
}
