'use client'

import { useState, useTransition } from 'react'
import { X, Loader2, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cancelInvite } from '@/app/(dashboard)/settings/actions'
import type { PendingInvite } from '@/lib/supabase/queries/workspaces'

interface Props {
  invite: PendingInvite
  isAdmin: boolean
}

export function PendingInviteRow({ invite, isAdmin }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    setError(null)
    startTransition(async () => {
      const result = await cancelInvite(invite.id)
      if (result?.error) setError(result.error)
    })
  }

  const expiresAt = new Date(invite.expires_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <Mail className="size-4 text-slate-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{invite.email}</p>
          <p className="text-xs text-slate-400">Expira em {expiresAt}</p>
        </div>

        <Badge variant="outline" className="shrink-0 text-xs text-slate-500">
          {invite.role === 'admin' ? 'Admin' : 'Membro'}
        </Badge>

        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-slate-400 hover:text-red-600"
            onClick={handleCancel}
            disabled={isPending}
            title="Cancelar convite"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
          </Button>
        )}
      </div>

      {error && (
        <p className="px-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
