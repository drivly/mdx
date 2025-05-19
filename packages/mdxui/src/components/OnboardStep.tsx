import { type JSX } from 'react'

/**
 * Display a single step in an onboarding flow.
 */
export interface OnboardStepProps {
  title: string
  content: React.ReactNode
  className?: string
}

export function OnboardStep({ title, content, className }: OnboardStepProps): JSX.Element {
  const base = 'space-y-2 rounded-md border border-gray-200 bg-white p-4'

  return (
    <section className={[base, className].filter(Boolean).join(' ')}>
      <h2 className='text-lg font-semibold'>{title}</h2>
      <div className='text-sm'>{content}</div>
    </section>
  )
}
