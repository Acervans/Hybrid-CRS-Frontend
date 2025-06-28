'use client'

import { useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import { StepOne } from '@/components/create-agent/step-one'
import { StepThree } from '@/components/create-agent/step-three'
import { StepTwo } from '@/components/create-agent/step-two'
import { Stepper } from '@/components/create-agent/stepper'

interface AgentWizardProps {
  onComplete?: () => void
}

export function AgentWizard({ onComplete }: AgentWizardProps) {
  const t = useTranslations('CreateAgent')
  const [currentStep, setCurrentStep] = useState(0)

  const steps = useMemo(
    () => [
      {
        label: t('stepOneLabel'),
        description: t('stepOneDescription')
      },
      {
        label: t('stepTwoLabel'),
        description: t('stepTwoDescription')
      },
      {
        label: t('stepThreeLabel'),
        description: t('stepThreeDescription')
      }
    ],
    [t]
  )

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold mb-2'>{t('title')}</h1>
        <p className='text-secondary-foreground'>{t('subtitle')}</p>
      </div>

      <div className='mb-6'>
        <Stepper steps={steps} currentStep={currentStep} className='max-w-2xl mx-auto' />
      </div>

      <div className='min-h-[600px]'>
        {currentStep === 0 && <StepOne onNext={handleNext} />}
        {currentStep === 1 && <StepTwo onNext={handleNext} onBack={handleBack} />}
        {currentStep === 2 && <StepThree onBack={handleBack} onComplete={handleComplete} />}
      </div>
    </div>
  )
}
