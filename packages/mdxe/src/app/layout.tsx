import React from 'react'

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) { 
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <div className='prose prose-slate max-w-7xl mx-auto p-4'>{children}</div>
      </body>
    </html>
  )
}
