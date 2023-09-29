import RecoilProvider from '@/context/RecoilProvider'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <RecoilProvider>
        <body className={inter.className}>
          <Header />
          {children}
        </body>
      </RecoilProvider>
    </html>
  )
}
