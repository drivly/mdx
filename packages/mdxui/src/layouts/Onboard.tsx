'use client'

import { ReactNode } from 'react'

interface OnboardLayoutProps {
  children: ReactNode
}

export const OnboardLayout = ({ children }: OnboardLayoutProps) => {
  return (
    <div className='onboard-layout'>
      <div className='onboard-steps-container'>{children}</div>
    </div>
  )
}
