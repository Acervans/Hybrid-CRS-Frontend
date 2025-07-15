import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline'
}

export default function Page() {
  return <h1 className='p-3'>You&apos;re Offline. Check your connection to use HybridCRS.</h1>
}
