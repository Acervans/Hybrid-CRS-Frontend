import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline'
}

export default function Page() {
  return (
    <>
      <h1>You're Offline</h1>
      <h2>Check your connection to use Hybrid-CRS</h2>
    </>
  )
}
