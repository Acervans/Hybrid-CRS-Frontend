'use client'

import Link from 'next/link'
import { useContext, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import GoogleButton from '@/components/auth/google-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SupabaseContext } from '@/contexts/supabaseContext'
import { login, signup } from '@/lib/actions'

export default function AuthForm(props: { isSignup?: boolean; params: SearchParams }) {
  const { isSignup, params } = props
  const nextParam = params.next ? `?next=${params.next}` : ''
  const t = useTranslations('Auth')
  const { handleLogin } = useContext(SupabaseContext)

  const LoginFormSchema = z.object({
    email: z
      .string()
      .email({ message: t('validEmail') })
      .trim(),
    password: z
      .string()
      .min(8, { message: t('minLen', { min: 8 }) })
      .regex(/[a-zA-Z]/, { message: t('passwordLetter') })
      .regex(/[0-9]/, { message: t('passwordNumber') })
      .regex(/[^a-zA-Z0-9]/, {
        message: t('passwordSpecial')
      })
      .trim()
  })

  const SignupFormSchema = z
    .object({
      username: z
        .string()
        .min(4, { message: t('minLen', { min: 4 }) })
        .trim(),
      email: z
        .string()
        .email({ message: t('validEmail') })
        .trim(),
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

  const schema = isSignup ? SignupFormSchema : LoginFormSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema as typeof SignupFormSchema),
    mode: isSignup ? 'onChange' : 'onSubmit',
    criteriaMode: 'all'
  })

  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [verifyEmail, setVerifyEmail] = useState(false)

  const onSubmit = async (data: Record<string, string>) => {
    setServerMessage(null)
    setVerifyEmail(false)

    const formData = new FormData()
    for (const key in data) {
      formData.append(key, data[key])
    }

    const errorCode = isSignup ? await signup(formData, params.next as string) : await login(formData)

    if (errorCode) {
      if (isSignup && errorCode === 'user_already_exists') {
        setServerMessage(t('alreadyExists', { email: `"${data.email}"` }))
      } else if (isSignup && errorCode === 'over_email_send_rate_limit') {
        setServerMessage(t('emailRateLimit'))
      } else if (!isSignup && errorCode === 'email_not_confirmed') {
        setServerMessage(t('emailNotVerified'))
      } else {
        setServerMessage(t('invalidCredentials'))
      }
    } else {
      if (isSignup) setVerifyEmail(true)
      else handleLogin(params.next as string)
    }
  }

  return (
    <div className='flex flex-col gap-4 max-w-2xl m-auto'>
      <div className='flex flex-col gap-4 mx-4 mt-2 px-2 whitespace-break-spaces'>
        <h2 className='font-semibold text-xl'>{isSignup ? t('welcomeSignup') : t('welcomeLogin')}</h2>
        <p>{t('welcomeDesc')}</p>
      </div>
      <Card className='mx-4 px-4'>
        <CardTitle>{isSignup ? t('signup') : t('login')}</CardTitle>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
          {verifyEmail && (
            <Alert className='text-primary bg-secondary'>
              <Check />
              <AlertTitle className='line-clamp-none'>{t('verifyEmail')}</AlertTitle>
            </Alert>
          )}
          {serverMessage && (
            <Alert className='text-destructive-foreground bg-destructive'>
              <AlertCircle />
              <AlertTitle className='line-clamp-none'>{serverMessage}</AlertTitle>
            </Alert>
          )}
          {isSignup && (
            <>
              <Label htmlFor='username' className='mt-2'>
                {t('username')}
              </Label>
              <Input id='username' type='text' {...register('username')} aria-invalid={!!errors.username} required />
              {errors.username && (
                <Alert className='text-destructive-foreground bg-destructive'>
                  <AlertCircle />
                  <AlertTitle className='line-clamp-none'>{errors.username.message}</AlertTitle>
                </Alert>
              )}
            </>
          )}
          <Label htmlFor='email' className='mt-2'>
            {t('email')}
          </Label>
          <Input id='email' type='email' {...register('email')} aria-invalid={!!errors.email} required />
          {errors.email && (
            <Alert className='text-destructive-foreground bg-destructive'>
              <AlertCircle />
              <AlertTitle className='line-clamp-none'>{errors.email.message}</AlertTitle>
            </Alert>
          )}
          <Label htmlFor='password' className='mt-2'>
            {t('password')}
          </Label>
          <Input id='password' type='password' {...register('password')} aria-invalid={!!errors.password} required />
          {errors.password && (
            <Alert className='text-destructive-foreground bg-destructive'>
              <AlertCircle />
              <AlertTitle className='line-clamp-none'>{t('passwordMust')}:</AlertTitle>
              <AlertDescription className='text-destructive-foreground'>
                <ul className='list-disc list-inside'>
                  {errors?.password?.types &&
                    Object.values(errors.password.types)
                      .flat()
                      .map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {isSignup && (
            <>
              <Label htmlFor='confirmPassword' className='mt-2'>
                {t('confirmPassword')}
              </Label>
              <Input
                id='confirmPassword'
                type='password'
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                required
              />
              {errors.confirmPassword && (
                <Alert className='text-destructive-foreground bg-destructive'>
                  <AlertCircle />
                  <AlertTitle className='line-clamp-none'>{errors.confirmPassword.message}</AlertTitle>
                </Alert>
              )}
            </>
          )}
          <div className='flex flex-col gap-4 mx-auto mt-2 w-73.5'>
            {isSignup ? (
              <div className='grid grid-cols-2 gap-2'>
                <Button type='submit' disabled={isSubmitting}>
                  {t('signup')}
                </Button>
                <Link href={`/login${nextParam}`}>
                  <Button type='button' variant='link' tabIndex={-1} className='w-full'>
                    {t('login')}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-2 gap-2'>
                  <Button type='submit' disabled={isSubmitting}>
                    {t('login')}
                  </Button>
                  <Link href={`/signup${nextParam}`}>
                    <Button type='button' variant='link' tabIndex={-1} className='w-full'>
                      {t('signup')}
                    </Button>
                  </Link>
                </div>
                <Link href='/reset-password'>
                  <Button type='button' variant='link' tabIndex={-1} className='w-full'>
                    {t('forgotPassword')}
                  </Button>
                </Link>
              </>
            )}
          </div>
          {/* Continue with Google below email login, with an ---- or ---- */}
          <div className='flex items-center gap-4'>
            <Separator className='flex-1' />
            <span className='text-muted-foreground'>{t('or')}</span>
            <Separator className='flex-1' />
          </div>
          <div className='mx-auto'>
            <GoogleButton />
          </div>
        </form>
      </Card>
    </div>
  )
}
