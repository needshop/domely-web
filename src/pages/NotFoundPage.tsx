import { buttonVariants } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import symbol from '@/assets/brand/symbol.svg'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <img src={symbol} alt="" className="size-20" />
      <h1 className="text-3xl">{t('notFound.title')}</h1>
      <p className="text-muted">{t('notFound.description')}</p>
      <Link to="/" className={buttonVariants({ variant: 'primary' })}>
        {t('notFound.back')}
      </Link>
    </div>
  )
}
