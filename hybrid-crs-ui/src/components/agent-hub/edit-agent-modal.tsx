'use client'

import type React from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle, Database, Globe, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { agentNameExists } from '@/lib/supabase/client'

interface EditAgentModalProps {
  isOpen: boolean
  onClose: () => void
  agent: RecommenderAgent
  onSave: (updatedAgent: Partial<RecommenderAgent>) => void
}

export function EditAgentModal({ isOpen, onClose, agent, onSave }: EditAgentModalProps) {
  const t = useTranslations('CreateAgent.StepOne')
  const { supabase, auth } = useContext(SupabaseContext)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [nameExists, setNameExists] = useState<boolean | null>(null)

  const formSchema = z.object({
    agentName: z.string().min(1, t('agentNameRequired')).max(50, t('agentNameLength')),
    description: z.string().max(300, t('descriptionLength')).optional(),
    public: z.boolean()
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agentName: agent.agentName,
      description: agent.description,
      public: agent.public
    }
  })

  type FormData = z.infer<typeof formSchema>

  const agentName = watch('agentName') || ''
  const description = watch('description') || ''

  const [debouncedAgentName] = useDebounce(agentName, 750)

  const onSubmit = (data: FormData) => {
    if (nameExists && data.agentName !== agent.agentName) {
      return
    }
    setNameExists(null)
    setIsCheckingName(false)
    clearErrors('agentName')
    onSave(data)
  }

  const getNameStatusIcon = () => {
    if (agentName === agent.agentName) {
      return null
    }

    if (isCheckingName) {
      return <div className='animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full' />
    }
    if (nameExists) {
      return <AlertCircle className='h-4 w-4 text-red-500' />
    }
    if (nameExists === false && debouncedAgentName.length > 0) {
      return <CheckCircle className='h-4 w-4 text-green-500' />
    }
    return null
  }

  const checkAgentName = useCallback(async () => {
    if (!auth?.data.user?.id) return

    // Don't check if name hasn't changed from original
    if (!debouncedAgentName || debouncedAgentName === agent.agentName) {
      clearErrors('agentName')
      setNameExists(null)
      setIsCheckingName(false)
      return
    }

    if (debouncedAgentName.toLowerCase() === agent.agentName.toLowerCase()) {
      clearErrors('agentName')
      setNameExists(false)
      setIsCheckingName(false)
      return
    }

    setIsCheckingName(true)
    agentNameExists(supabase, auth.data.user.id, debouncedAgentName)
      .then(exists => {
        setNameExists(exists)
        if (exists) {
          setError('agentName', {
            type: 'manual',
            message: t('agentNameExists')
          })
        } else {
          clearErrors('agentName')
        }
      })
      .catch(error => {
        console.error('Error checking agent name:', error)
        setNameExists(null)
      })
      .finally(() => {
        setIsCheckingName(false)
      })
  }, [debouncedAgentName, agent.agentName, supabase, auth?.data.user?.id, setError, clearErrors, t])

  useEffect(() => {
    setNameExists(null)
    setIsCheckingName(false)
    if (isOpen) {
      reset({
        agentName: agent.agentName,
        description: agent.description,
        public: agent.public
      })
    }
  }, [isOpen, agent, reset])

  useEffect(() => {
    if (isOpen) {
      checkAgentName()
    }
  }, [isOpen, checkAgentName])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md bg-card'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='agent-name' className='text-sm font-medium'>
              {t('agentName')} <span className='text-red-500'>*</span>
            </Label>
            <div className='relative'>
              <Input
                id='agent-name'
                {...register('agentName', {
                  onChange: e => {
                    const equal = e.target.value === debouncedAgentName

                    setIsCheckingName(e.target.value && !equal)
                    if (equal && nameExists) {
                      setTimeout(
                        () =>
                          setError('agentName', {
                            type: 'manual',
                            message: t('agentNameExists')
                          }),
                        50
                      )
                    }
                  }
                })}
                placeholder={t('agentNameEditPlaceholder')}
                maxLength={50}
                className={`pr-10 ${
                  errors.agentName
                    ? 'border-red-500'
                    : nameExists === false && agentName !== agent.agentName
                      ? 'border-green-500'
                      : ''
                }`}
              />
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>{getNameStatusIcon()}</div>
            </div>
            <div className='flex justify-between text-xs text-muted-foreground'>
              <div className='flex flex-col'>
                {isCheckingName ? (
                  <span className='text-blue-500'>{t('checkingAvailability')}</span>
                ) : (
                  <>
                    {errors.agentName && <span className='text-red-500'>{errors.agentName.message}</span>}
                    {!errors.agentName && nameExists === false && debouncedAgentName.length > 0 && (
                      <span className='text-green-600'>{t('agentNameAvailable')}</span>
                    )}
                  </>
                )}
              </div>
              <span>
                {agentName.length}/50 {t('characters')}
              </span>
            </div>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium flex items-center gap-2'>
              <Database className='h-4 w-4' />
              {t('datasetName')}
            </Label>
            <Input value={agent.datasetName} disabled />
            <p className='text-xs text-muted-foreground'>{t('datasetConstraint')}</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description' className='text-sm font-medium'>
              {t('description')} <span className='text-muted-foreground'>({t('optional')})</span>
            </Label>
            <Textarea
              id='description'
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              maxLength={300}
              className={errors.description ? 'border-red-500' : ''}
            />
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span className='text-red-500'>{errors.description?.message}</span>
              <span>
                {description.length}/300 {t('characters')}
              </span>
            </div>
          </div>

          <div className='space-y-3'>
            <Label className='text-sm font-medium'>{t('visibility')}</Label>
            <div className='flex items-center space-x-3'>
              <Checkbox
                id='is-public'
                checked={watch('public')}
                onCheckedChange={checked => setValue('public', checked as boolean)}
              />
              <div className='flex items-center gap-2'>
                <Label htmlFor='is-public' className='text-sm font-medium cursor-pointer'>
                  {t('makePublic')}
                </Label>
                {watch('public') ? (
                  <Globe className='h-4 w-4 text-green-600' />
                ) : (
                  <Lock className='h-4 w-4 text-muted-foreground' />
                )}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              {watch('public') ? t('publicDescription') : t('privateDescription')}
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || nameExists || isCheckingName || agentName !== debouncedAgentName}
          >
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
