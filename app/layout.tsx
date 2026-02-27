import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Abyan's Profile",
  description: "Personal profile and achievements showcase",
  icons: {
    icon: 'https://i.imgur.com/banKsj6.png',
  },
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
