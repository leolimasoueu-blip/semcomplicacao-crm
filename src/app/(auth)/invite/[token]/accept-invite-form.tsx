'use client'

import { useState, useTransition } from 'react'
import { acceptInvite } from './actions'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

interface Props {
  token: string
  userEmail: string
  inviteEmail: string
}

export function AcceptInviteForm({ token, userEmail, inviteEmail }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const emailMismatch = userEmail.toLowerCase() !== inviteEmail.toLowerCase()

  if (emailMismatch) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">Conta incorreta</p>
          <p className="mt-1 text-sm text-amber-700">
            Este convite foi enviado para{' '}
            <span className="font-semibold">{inviteEmail}</span>. Você está logado como{' '}
            <span className="font-semibold">{userEmail}</span>.
          </p>
        </div>
      </div>
    )
  }

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptInvite(token)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <Button
        onClick={handleAccept}
        disabled={isPending}
        className="w-full bg-sky-500 hover:bg-sky-600"
        size="lg"
      >
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Aceitar convite e entrar no workspace
      </Button>
    </div>
  )
}
