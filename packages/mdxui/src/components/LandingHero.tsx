import { type JSX, type ReactNode } from 'react'

export interface LandingHeroProps {
  headline: string
  badgeText?: string
  badgeHref?: string
  callToAction?: ReactNode
  secondaryCTA?: ReactNode
  className?: string
}

export function LandingHero({ headline, badgeText, badgeHref, callToAction, secondaryCTA, className }: LandingHeroProps): JSX.Element {
  return (
    <section className={`py-16 text-center ${className ?? ''}`}>
      {badgeText && (
        badgeHref ? (
          <a href={badgeHref} className='mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-100'>
            {badgeText}
          </a>
        ) : (
          <span className='mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600'>
            {badgeText}
          </span>
        )
      )}
      <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>{headline}</h1>
      {(callToAction || secondaryCTA) && (
        <div className='mt-6 flex justify-center gap-4'>
          {callToAction && <div>{callToAction}</div>}
          {secondaryCTA && <div>{secondaryCTA}</div>}
        </div>
      )}
    </section>
  )
}
