'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { inviteMember } from '@/app/(dashboard)/settings/actions'

interface Props {
  workspaceId: string
  disabled?: boolean
  disabledReason?: string
}

export function InviteForm({ workspaceId, disabled, disabledReason }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await inviteMember(workspaceId, email.trim(), role)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setEmail('')
        setRole('member')
        setTimeout(() => setSuccess(false), 6000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="invite-email">E-mail</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colaborador@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled || isPending}
            required
          />
        </div>

        <div className="space-y-1.5 sm:w-36">
          <Label htmlFor="invite-role">Papel</Label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as 'admin' | 'member')}
            disabled={disabled || isPending}
          >
            <SelectTrigger id="invite-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Membro</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="submit"
            disabled={disabled || isPending || !email.trim()}
            className="w-full bg-sky-500 hover:bg-sky-600 sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 size-4" />
            )}
            Convidar
          </Button>
        </div>
      </div>

      {/* Disabled reason (plan limit) */}
      {disabled && disabledReason && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-700">{disabledReason}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
          <p className="text-sm text-green-700">Convite enviado com sucesso!</p>
        </div>
      )}
    </form>
  )
}
