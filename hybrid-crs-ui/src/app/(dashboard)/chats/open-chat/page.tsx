import type { Metadata } from 'next'
import OpenChat from '@/views/OpenChat'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('open-chat')
  }
}

export default function Page() {
  return <OpenChat />
}
