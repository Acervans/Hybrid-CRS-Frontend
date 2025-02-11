'use client'

import React from 'react'

export default function ChatsLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <React.Fragment>
      <link href='https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css' rel='stylesheet' />
      {children}
    </React.Fragment>
  )
}
