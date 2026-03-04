import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aviator Game',
  description: 'Aviator crash game — demo mode',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
