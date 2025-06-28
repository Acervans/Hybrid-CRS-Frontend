import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import OpenChat from '@/views/OpenChat'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('open-chat')
  }
}

export default function Page() {
  return <OpenChat />
}
