import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Zen-Sheet · Org Builder', description: 'Simple editable organization builder' }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html> }