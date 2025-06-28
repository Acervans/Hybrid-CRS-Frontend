import { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { CreateAgent } from '@/views/CreateAgent'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('create-agent')
  }
}

export default function CreateAgentPage() {
  return <CreateAgent />
}
