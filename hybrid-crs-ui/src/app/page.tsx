'use client'

import { Button } from '@mantine/core'
import Link from 'next/link'

export default function Home() {
  return (
    <div className=''>
      <Button variant='filled'>Hi</Button>
      <Link href={'/chats/open-chat'}>Chats</Link>
    </div>
  )
}
