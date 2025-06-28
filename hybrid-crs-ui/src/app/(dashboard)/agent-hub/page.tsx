import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { AgentHub } from '@/views/AgentHub'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('agent-hub')
  }
}

export default function AgentHubPage() {
  return <AgentHub />
}
