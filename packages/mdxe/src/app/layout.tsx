import React from 'react'

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) { 
  return (
    <html lang="en">
      <body className='prose prose-slate max-w-7xl mx-auto p-4'>{children}</body>
    </html>
  )
}
