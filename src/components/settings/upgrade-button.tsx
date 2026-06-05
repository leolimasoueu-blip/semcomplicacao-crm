'use client'

import { useTransition } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/lib/stripe/actions'

interface Props {
  workspaceId: string
  variant?: 'default' | 'outline'
  className?: string
}

export function UpgradeButton({ workspaceId, variant = 'default', className }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      onClick={() => startTransition(() => createCheckoutSession(workspaceId))}
      disabled={isPending}
      variant={variant}
      className={className ?? 'bg-sky-500 hover:bg-sky-600 text-white'}
    >
      {isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Zap className="mr-2 size-4" />
      )}
      Fazer upgrade para Pro — R$49/mês
    </Button>
  )
}
