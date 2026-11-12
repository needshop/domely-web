import type { ReactNode } from 'react'

/** Titre de page d'authentification (h1) et texte d'introduction. */
export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-1.5">
      <h1 className="text-2xl">{title}</h1>
      {children && <p className="text-sm text-muted">{children}</p>}
    </div>
  )
}
