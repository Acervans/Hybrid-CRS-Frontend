import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline'
}

export default function Page() {
  return (
    <>
      <h1>You&apos;re Offline</h1>
      <br />
      <h2>Check your connection to use HybridCRS</h2>
    </>
  )
}
