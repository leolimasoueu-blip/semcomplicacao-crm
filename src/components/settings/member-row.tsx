'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { removeMember, updateMemberRole } from '@/app/(dashboard)/settings/actions'
import type { WorkspaceMember } from '@/lib/supabase/queries/workspaces'

interface Props {
  member: WorkspaceMember
  currentUserId: string
  isCurrentUserAdmin: boolean
  workspaceId: string
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return (email?.[0] ?? '?').toUpperCase()
}

export function MemberRow({ member, currentUserId, isCurrentUserAdmin, workspaceId }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isSelf = member.user_id === currentUserId
  const router = useRouter()

  function handleRoleChange(role: 'admin' | 'member') {
    if (role === member.role) return
    setError(null)
    startTransition(async () => {
      const result = await updateMemberRole(member.id, role, workspaceId)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await removeMember(member.id, currentUserId)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  const displayName = member.full_name ?? member.email ?? 'Usuário'
  const initials = getInitials(member.full_name, member.email)

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
        {/* Avatar */}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
            {isSelf && (
              <span className="text-xs text-slate-400">(você)</span>
            )}
          </div>
          {member.full_name && (
            <p className="truncate text-xs text-slate-500">{member.email}</p>
          )}
        </div>

        {/* Role */}
        {isCurrentUserAdmin && !isSelf ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <>
                  <RoleBadge role={member.role} />
                  <ChevronDown className="size-3 text-slate-400" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
                <span className="flex w-full items-center justify-between">
                  Admin
                  {member.role === 'admin' && <span className="text-sky-500">✓</span>}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange('member')}>
                <span className="flex w-full items-center justify-between">
                  Membro
                  {member.role === 'member' && <span className="text-sky-500">✓</span>}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleRemove}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 size-3.5" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </div>

      {error && (
        <p className="px-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: 'admin' | 'member' }) {
  return role === 'admin' ? (
    <Badge variant="secondary" className="bg-sky-100 text-sky-700 hover:bg-sky-100">
      Admin
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">
      Membro
    </Badge>
  )
}
