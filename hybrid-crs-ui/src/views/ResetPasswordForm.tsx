'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useContext, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FieldErrors, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { resetPasswordRequest } from '@/lib/actions'

export default function ResetPasswordForm() {
  const t = useTranslations('Auth')
  const { supabase, auth } = useContext(SupabaseContext)
  const router = useRouter()

  const ResetFormSchema = z.object({
    email: z
      .string()
      .email({ message: t('validEmail') })
      .trim()
  })

  const PasswordFormSchema = z
    .object({
      password: z
        .string()
        .min(8, { message: t('minLen', { min: 8 }) })
        .regex(/[a-zA-Z]/, { message: t('passwordLetter') })
        .regex(/[0-9]/, { message: t('passwordNumber') })
        .regex(/[^a-zA-Z0-9]/, {
          message: t('passwordSpecial')
        })
        .trim(),
      confirmPassword: z.string().trim()
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('passwordsMatch'),
      path: ['confirmPassword']
    })

  type ResetSchemaType = z.infer<typeof ResetFormSchema>
  type PasswordSchemaType = z.infer<typeof PasswordFormSchema>

  const schema: z.ZodType<ResetSchemaType | PasswordSchemaType> = !auth?.data.user
    ? ResetFormSchema
    : PasswordFormSchema

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    mode: !auth?.data.user ? 'onSubmit' : 'onChange',
    criteriaMode: 'all'
  })

  const typedErrors = errors as FieldErrors<ResetSchemaType & PasswordSchemaType>

  const [serverMessage, setServerMessage] = useState<{ msg: string; ok: boolean } | null>(null)

  const onSubmit = async (data: Record<string, string>) => {
    setServerMessage(null)

    if (auth?.data.user) {
      const { error } = await supabase.auth.updateUser({ password: data['password'] })

      if (error) {
        if (error.code === 'same_password') {
          setServerMessage({ msg: t('samePassword'), ok: false })
        } else {
          setServerMessage({ msg: t('error'), ok: false })
        }
      } else {
        setServerMessage({ msg: t('resetSuccess'), ok: true })
        reset()
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    } else {
      const errorCode = await resetPasswordRequest(data['email'])

      if (errorCode) {
        setServerMessage({ msg: t('error'), ok: false })
      } else {
        setServerMessage({
          msg: t('resetSent'),
          ok: true
        })
      }
    }
  }

  return (
    <div className='flex flex-col gap-4 max-w-2xl m-auto'>
      <div className='flex flex-col gap-4 mx-4 mt-2 px-2 whitespace-break-spaces'>
        <h2 className='font-semibold text-xl'>{t('resetTitle')}</h2>
      </div>
      <Card className='mx-4 px-4'>
        <CardTitle>{t('resetPassword')}</CardTitle>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
          {serverMessage && (
            <Alert
              className={
                serverMessage.ok ? 'text-emerald-500 bg-secondary' : 'text-destructive-foreground bg-destructive'
              }
            >
              {serverMessage.ok ? <Check /> : <AlertCircle />}
              <AlertTitle className='line-clamp-none'>{serverMessage.msg}</AlertTitle>
            </Alert>
          )}
          {!auth?.data.user ? (
            <>
              <Label htmlFor='email' className='mt-2'>
                {t('email')}
              </Label>
              <Input id='email' type='email' {...register('email')} aria-invalid={!!typedErrors.email} required />
              {typedErrors.email && (
                <Alert className='text-destructive-foreground bg-destructive'>
                  <AlertCircle />
                  <AlertTitle className='line-clamp-none'>{typedErrors.email.message}</AlertTitle>
                </Alert>
              )}
            </>
          ) : (
            <>
              <Label htmlFor='password' className='mt-2'>
                {t('password')}
              </Label>
              <Input
                id='password'
                type='password'
                {...register('password')}
                aria-invalid={!!typedErrors.password}
                required
              />
              {typedErrors.password && (
                <Alert className='text-destructive-foreground bg-destructive'>
                  <AlertCircle />
                  <AlertTitle className='line-clamp-none'>{t('passwordMust')}:</AlertTitle>
                  <AlertDescription className='text-destructive-foreground'>
                    <ul className='list-disc list-inside'>
                      {typedErrors?.password?.types &&
                        Object.values(typedErrors.password.types)
                          .flat()
                          .map((error, i) => <li key={i}>{error}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              <Label htmlFor='confirmPassword' className='mt-2'>
                {t('confirmPassword')}
              </Label>
              <Input
                id='confirmPassword'
                type='password'
                {...register('confirmPassword')}
                aria-invalid={!!typedErrors.confirmPassword}
                required
              />
              {typedErrors.confirmPassword && (
                <Alert className='text-destructive-foreground bg-destructive'>
                  <AlertCircle />
                  <AlertTitle className='line-clamp-none'>{typedErrors.confirmPassword.message}</AlertTitle>
                </Alert>
              )}
            </>
          )}
          <div className='flex flex-col gap-2 mt-2'>
            <Button type='submit' disabled={isSubmitting}>
              {t('resetPassword')}
            </Button>
          </div>
          {!auth?.data.user && (
            <>
              <div className='flex items-center gap-4'>
                <Separator className='flex-1' />
                <span className='text-muted-foreground'>{t('or')}</span>
                <Separator className='flex-1' />
              </div>
              <div className='flex flex-row justify-center gap-2 mt-2'>
                <Link href='/login'>
                  <Button type='button' variant='link' className='w-full'>
                    {t('login')}
                  </Button>
                </Link>
                <Link href='/signup'>
                  <Button type='button' variant='link' className='w-full'>
                    {t('signup')}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  )
}
