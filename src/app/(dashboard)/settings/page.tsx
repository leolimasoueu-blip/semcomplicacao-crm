import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Mail, Building2, Crown, Zap, CreditCard, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MemberRow } from '@/components/settings/member-row'
import { InviteForm } from '@/components/settings/invite-form'
import { PendingInviteRow } from '@/components/settings/pending-invite-row'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import {
  getActiveWorkspaceId,
  getWorkspaceInfo,
  getWorkspaceMembers,
  getPendingInvites,
  getWorkspaceSubscription,
} from '@/lib/supabase/queries/workspaces'
import { canAddMember, FREE_MEMBER_LIMIT } from '@/lib/limits'

export default async function SettingsPage() {
  const [workspaceId, supabase] = await Promise.all([
    getActiveWorkspaceId(),
    getSupabaseServerClient(),
  ])

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [workspace, members, pendingInvites, subscription, memberLimit] = await Promise.all([
    getWorkspaceInfo(workspaceId),
    getWorkspaceMembers(workspaceId),
    getPendingInvites(workspaceId),
    getWorkspaceSubscription(workspaceId),
    canAddMember(workspaceId),
  ])

  const currentMember = members.find((m) => m.user_id === user.id)
  const isAdmin = currentMember?.role === 'admin'
  const plan = subscription?.plan ?? 'free'
  const memberCount = members.length
  const atMemberLimit = !memberLimit.allowed

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie seu workspace, membros e plano"
      />

      {/* Plan banner */}
      <div className={`flex items-start gap-3 rounded-xl border p-4 ${
        plan === 'pro'
          ? 'border-sky-200 bg-sky-50'
          : 'border-slate-200 bg-slate-50'
      }`}>
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
          plan === 'pro' ? 'bg-sky-500' : 'bg-slate-400'
        }`}>
          {plan === 'pro' ? (
            <Zap className="size-4 text-white" />
          ) : (
            <Crown className="size-4 text-white" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Plano {plan === 'pro' ? 'Pro' : 'Free'}
          </p>
          <p className="text-xs text-slate-500">
            {plan === 'free'
              ? `${memberCount} de ${FREE_MEMBER_LIMIT} membros usados`
              : 'Membros e leads ilimitados'}
          </p>
        </div>
        {plan === 'free' && (
          <a
            href="/settings/billing"
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            Fazer upgrade
          </a>
        )}
      </div>

      {/* Workspace info */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Building2 className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Workspace</h2>
        </div>
        <div className="space-y-3 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Nome</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {workspace?.name ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Slug</p>
            <p className="mt-0.5 font-mono text-sm text-slate-600">
              {workspace?.slug ?? '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Membros</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {memberCount}{plan === 'free' ? `/${FREE_MEMBER_LIMIT}` : ''}
          </span>
        </div>

        <div className="divide-y divide-slate-50 px-3 py-2">
          {members.map((member) => (
            <div key={member.id} className="py-1">
              <MemberRow
                member={member}
                currentUserId={user.id}
                isCurrentUserAdmin={isAdmin}
                workspaceId={workspaceId}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Invite section (admin only) */}
      {isAdmin && (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Mail className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Convidar membros</h2>
          </div>
          <div className="px-5 py-4">
            <InviteForm
              workspaceId={workspaceId}
              disabled={atMemberLimit}
              disabledReason={
                atMemberLimit
                  ? `O plano Free permite no máximo ${FREE_MEMBER_LIMIT} membros. Faça upgrade para Pro para convidar mais.`
                  : undefined
              }
            />
          </div>

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4">
              <p className="mb-3 text-xs font-medium text-slate-500">
                Convites pendentes ({pendingInvites.length})
              </p>
              <div className="space-y-1">
                {pendingInvites.map((invite) => (
                  <PendingInviteRow key={invite.id} invite={invite} isAdmin={isAdmin} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      {/* Billing link */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <Link
          href="/settings/billing"
          className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="size-4 text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Faturamento</p>
              <p className="text-xs text-slate-500">
                Plano {plan === 'pro' ? 'Pro' : 'Free'} · Gerencie sua assinatura
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-400" />
        </Link>
      </section>
    </div>
  )
}
