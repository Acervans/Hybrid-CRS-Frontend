'use client'

import { useRouter } from 'next/navigation'

import { AgentWizard } from '@/components/create-agent/agent-wizard'
import { DataProvider } from '@/contexts/dataContext'

export function CreateAgent() {
  const router = useRouter()

  const handleWizardComplete = () => {
    // Handle completion - redirect back to main page
    router.push('/')
  }

  return (
    <DataProvider>
      <div className='relative'>
        <AgentWizard onComplete={handleWizardComplete} />
      </div>
    </DataProvider>
  )
}
