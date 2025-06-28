'use client'

import { CheckCircle } from 'lucide-react'

interface Step {
  label: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className='flex items-center'>
          <div className='flex flex-col items-center'>
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                ${
                  index < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : index === currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-muted border-muted-foreground text-muted-foreground'
                }
              `}
            >
              {index < currentStep ? (
                <CheckCircle className='w-6 h-6' />
              ) : (
                <span className='text-sm font-semibold'>{index + 1}</span>
              )}
            </div>

            <div className='mt-2 text-center'>
              <div className={`text-xs sm:text-sm font-medium ${index <= currentStep ? '' : 'text-muted-foreground'}`}>
                {step.label}
              </div>
              {step.description && (
                <div className='hidden sm:block sm:text-xs text-muted-foreground mt-1'>{step.description}</div>
              )}
            </div>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`
                w-0 sm:w-16 h-0.5 mx-4 transition-all duration-200
                ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  )
}
