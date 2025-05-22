import type { Metadata } from 'next'
import Link from 'next/link'

import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { Input } from '@/components/ui/input'
import MultipleSelector, { Option } from '@/components/ui/multiple-selector'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Titles')

  return {
    title: t('dashboard')
  }
}

const OPTIONS: Option[] = [
  { label: 'nextjs', value: 'nextjs' },
  { label: 'React', value: 'react' },
  { label: 'Remix', value: 'remix' },
  { label: 'Vite', value: 'vite' },
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Angular', value: 'angular' },
  { label: 'Ember', value: 'ember', disable: true },
  { label: 'Gatsby', value: 'gatsby', disable: true },
  { label: 'Astro', value: 'astro' }
]

export default function Page() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2'>
      {[...Array(10).keys()].map(x => {
        return (
          <Card key={x}>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-2'>
              <Button variant='default'>Default</Button>
              <Button variant='secondary'>Secondary</Button>
              <Button variant='outline'>Outline</Button>
              <Button variant='ghost'>Ghost</Button>
              <Button variant='link'>Link</Button>
              <Input placeholder='Placeholder' />
              <FloatingLabelInput id={`floating-demo-${x}`} label='Floating Label' labelClassName='bg-card' />
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
              <Link href={'/chats/open-chat'}>Chats</Link>
            </CardFooter>
          </Card>
        )
      })}
      <MultipleSelector
        defaultOptions={OPTIONS}
        placeholder='Select frameworks you like...'
        emptyIndicator={
          <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>no results found.</p>
        }
      />
    </div>
  )
}
