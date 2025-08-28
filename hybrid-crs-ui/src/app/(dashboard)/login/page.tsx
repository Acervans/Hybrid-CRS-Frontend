import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import AuthForm from '@/views/AuthForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('login')
  }
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  return <AuthForm params={await searchParams} />
}
