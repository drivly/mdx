import React from 'react'

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) { 
  return (
    <div className="root-layout">
      <div className='prose prose-slate max-w-7xl mx-auto p-4'>{children}</div>
    </div>
  )
}
