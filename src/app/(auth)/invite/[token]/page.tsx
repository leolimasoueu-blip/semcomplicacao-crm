import Link from 'next/link'
import { Users, Clock, LogIn, UserPlus } from 'lucide-react'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { AcceptInviteForm } from './accept-invite-form'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const admin = getSupabaseAdminClient()
  const supabase = await getSupabaseServerClient()

  // Fetch invite bypassing RLS — user may not yet be a member
  const { data: invite } = await admin
    .from('workspace_invites')
    .select('id, email, role, accepted_at, expires_at, workspaces(name, slug)')
    .eq('token', token)
    .single()

  if (!invite) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100">
            <Clock className="size-7 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Convite inválido</h1>
        <p className="text-slate-500">
          Este link de convite é inválido ou já expirou. Peça ao admin um novo convite.
        </p>
        <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }))}>
          Ir para o login
        </Link>
      </div>
    )
  }

  if (invite.accepted_at) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
            <Users className="size-7 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Convite já aceito</h1>
        <p className="text-slate-500">Este convite já foi utilizado.</p>
        <Link
          href="/dashboard"
          className={cn(buttonVariants(), 'bg-sky-500 hover:bg-sky-600 text-white')}
        >
          Ir para o dashboard
        </Link>
      </div>
    )
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-100">
            <Clock className="size-7 text-amber-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Convite expirado</h1>
        <p className="text-slate-500">
          Este convite expirou. Peça ao admin um novo convite.
        </p>
        <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }))}>
          Ir para o login
        </Link>
      </div>
    )
  }

  const workspace = invite.workspaces as { name: string; slug: string } | null
  const workspaceName = workspace?.name ?? 'workspace'
  const rolePt = invite.role === 'admin' ? 'Administrador' : 'Membro'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-sky-100">
          <Users className="size-7 text-sky-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Você foi convidado!</h1>
        <p className="mt-2 text-slate-500">
          Para colaborar no workspace{' '}
          <span className="font-semibold text-slate-700">{workspaceName}</span> como{' '}
          <span className="font-semibold text-slate-700">{rolePt}</span>.
        </p>
      </div>

      {/* Invite card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-base font-bold text-white">
            {workspaceName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{workspaceName}</p>
            <p className="text-sm text-slate-500">Papel: {rolePt}</p>
          </div>
        </div>

        {user ? (
          <AcceptInviteForm
            token={token}
            userEmail={user.email ?? ''}
            inviteEmail={invite.email}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Faça login ou crie uma conta com{' '}
              <span className="font-semibold">{invite.email}</span> para aceitar o convite.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants(),
                  'w-full justify-center bg-sky-500 hover:bg-sky-600 text-white'
                )}
              >
                <LogIn className="mr-2 size-4" />
                Entrar na minha conta
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}
              >
                <UserPlus className="mr-2 size-4" />
                Criar nova conta
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400">
        Convite válido até{' '}
        {new Date(invite.expires_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </div>
  )
}
