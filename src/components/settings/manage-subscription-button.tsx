'use client'

import { useTransition } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPortalSession } from '@/lib/stripe/actions'

interface Props {
  workspaceId: string
}

export function ManageSubscriptionButton({ workspaceId }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      onClick={() => startTransition(() => createPortalSession(workspaceId))}
      disabled={isPending}
      variant="outline"
    >
      {isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <ExternalLink className="mr-2 size-4" />
      )}
      Gerenciar assinatura
    </Button>
  )
}
