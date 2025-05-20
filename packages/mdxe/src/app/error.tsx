'use client'

import React from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '1rem' 
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong!</h1>
      <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={() => reset()}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#3B82F6', color: 'white', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  )
}
