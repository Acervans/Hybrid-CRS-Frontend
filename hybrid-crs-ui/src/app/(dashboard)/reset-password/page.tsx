import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import ResetPasswordForm from '@/views/ResetPasswordForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('reset-password')
  }
}

export default async function ResetPasswordPage() {
  return <ResetPasswordForm />
}
