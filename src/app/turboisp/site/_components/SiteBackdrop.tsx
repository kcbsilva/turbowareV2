'use client'

export function SiteBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 turbo-mesh" />
      <div className="absolute inset-0 turbo-streaks" />
      <div className="absolute inset-0 turbo-grid" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[420px] turbo-hero-burst" />
      <div className="absolute top-[38%] -left-24 w-72 h-72 rounded-full turbo-orb turbo-orb--orange" />
      <div className="absolute top-[12%] -right-16 w-56 h-56 rounded-full turbo-orb turbo-orb--cyan" />
    </div>
  )
}
