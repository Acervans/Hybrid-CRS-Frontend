'use client'

import { useRouter } from 'next/navigation'
import type React from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Globe, Info, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import z from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDataContext } from '@/contexts/dataContext'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { agentNameExists } from '@/lib/supabase/client'

interface StepOneProps {
  onNext: () => void
}

export function StepOne({ onNext }: StepOneProps) {
  const t = useTranslations('CreateAgent.StepOne')
  const router = useRouter()
  const { agentConfig, updateAgentConfig } = useDataContext()
  const { supabase, auth } = useContext(SupabaseContext)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [nameExists, setNameExists] = useState<boolean | null>(null)

  const schema = z.object({
    agentName: z.string().min(1, t('agentNameRequired')).max(50, t('agentNameLength')),
    datasetName: z.string().min(1, t('datasetNameRequired')).max(50, t('datasetNameLength')),
    description: z.string().max(300, t('descriptionLength')).optional(),
    public: z.boolean()
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      agentName: '',
      datasetName: '',
      description: '',
      public: false
    },
    mode: 'onChange'
  })

  const agentName = watch('agentName') || ''
  const datasetName = watch('datasetName') || ''
  const description = watch('description') || ''

  const [debouncedAgentName] = useDebounce(agentName, 750)

  const onSubmit = (data: FormData) => {
    if (nameExists) {
      return
    }
    updateAgentConfig(data as AgentConfiguration)
    onNext()
  }

  const getNameStatusIcon = () => {
    if (isCheckingName) {
      return <div className='animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full' />
    }
    if (nameExists === true) {
      return <AlertCircle className='h-4 w-4 text-red-500' />
    }
    if (nameExists === false && debouncedAgentName.length > 0) {
      return <CheckCircle className='h-4 w-4 text-green-500' />
    }
    return null
  }

  const checkAgentName = useCallback(async () => {
    if (!auth?.data.user?.id) return

    if (!debouncedAgentName) {
      setNameExists(null)
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
  }, [debouncedAgentName, supabase, auth?.data.user?.id, setError, clearErrors, t])

  useEffect(() => {
    if (agentConfig) {
      reset({
        agentName: agentConfig.agentName || '',
        datasetName: agentConfig.datasetName || '',
        description: agentConfig.description || '',
        public: agentConfig.public || false
      })
    }
  }, [agentConfig, reset])

  useEffect(() => {
    checkAgentName()
  }, [checkAgentName])

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold'>{t('title')}</h2>
        <p className='text-muted-foreground'>{t('subtitle')}</p>
      </div>

      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>{t('infoAlert')}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('agentConfig')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
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
                  placeholder={t('agentNamePlaceholder')}
                  maxLength={50}
                  className={`pr-10 ${errors.agentName ? 'border-red-500' : nameExists === false ? 'border-green-500' : ''}`}
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
              <Label htmlFor='dataset-name' className='text-sm font-medium'>
                {t('datasetName')} <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='dataset-name'
                {...register('datasetName')}
                placeholder={t('datasetNamePlaceholder')}
                maxLength={50}
                className={errors.datasetName ? 'border-red-500' : ''}
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{errors.datasetName && <span className='text-red-500'>{errors.datasetName.message}</span>}</span>
                <span>
                  {datasetName.length}/50 {t('characters')}
                </span>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description' className='text-sm font-medium'>
                {t('description')} <span className='text-muted-foreground'>({t('optional')})</span>
              </Label>
              <Textarea
                id='description'
                {...register('description')}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                maxLength={300}
                className={errors.description ? 'border-red-500' : ''}
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{errors.description && <span className='text-red-500'>{errors.description.message}</span>}</span>
                <span>
                  {description.length}/300 {t('characters')}
                </span>
              </div>
            </div>

            <div className='space-y-3'>
              <Label className='text-sm font-medium'>{t('visibility')}</Label>
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='public'
                  checked={watch('public')}
                  onCheckedChange={checked => setValue('public', checked as boolean)}
                />
                <div className='flex items-center gap-2'>
                  <Label htmlFor='public' className='text-sm font-medium cursor-pointer'>
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

            <div className='flex flex-col sm:flex-row gap-2 justify-between pt-2'>
              <Button type='button' variant='outline' onClick={() => router.back()} className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                {t('goBack')}
              </Button>
              <Button
                type='submit'
                className='flex items-center gap-2'
                disabled={nameExists || isCheckingName || agentName !== debouncedAgentName}
              >
                {t('continue')}
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
