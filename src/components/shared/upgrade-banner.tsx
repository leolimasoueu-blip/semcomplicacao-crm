import { Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  workspaceId: string
  message?: string
  className?: string
}

export function UpgradeBanner({ message, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-sky-800">
        <Zap className="size-4 shrink-0 text-sky-500" />
        <span>{message ?? 'Você atingiu o limite do plano Free.'}</span>
      </div>
      <Link
        href="/settings/billing"
        className="shrink-0 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600"
      >
        Fazer upgrade
      </Link>
    </div>
  )
}
