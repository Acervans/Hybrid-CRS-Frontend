import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import AuthForm from '@/views/AuthForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('signup')
  }
}

export default async function SignupPage({ searchParams }: PageProps<'/signup'>) {
  return <AuthForm isSignup params={await searchParams} />
}
