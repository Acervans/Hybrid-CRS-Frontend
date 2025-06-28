'use client'

import React from 'react'

export default function ChatLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <React.Fragment>
      <style global jsx>{`
        body {
          overflow-y: hidden;
        }
      `}</style>
      <link href='https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css' rel='stylesheet' />
      {children}
    </React.Fragment>
  )
}
