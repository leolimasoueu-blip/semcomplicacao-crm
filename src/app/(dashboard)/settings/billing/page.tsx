import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getActiveWorkspaceId } from '@/lib/supabase/queries/workspaces'
import { redirect } from 'next/navigation'
import { CheckCircle2, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UpgradeButton } from '@/components/settings/upgrade-button'
import { ManageSubscriptionButton } from '@/components/settings/manage-subscription-button'

export default async function BillingPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/onboarding')

  const admin = getSupabaseAdminClient()
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan, status, current_period_end, stripe_customer_id')
    .eq('workspace_id', workspaceId)
    .single()

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Faturamento</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie seu plano e assinatura.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Plano atual</CardTitle>
              <CardDescription>
                {isPro ? 'Você está no plano Pro — recursos ilimitados.' : 'Você está no plano Free.'}
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className={
                isPro
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-slate-100 text-slate-600'
              }
            >
              {isPro ? 'Pro' : 'Free'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isPro ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Valor</p>
                  <p className="font-medium text-slate-900">R$49/mês</p>
                </div>
                {renewalDate && (
                  <div>
                    <p className="text-slate-500">Próxima renovação</p>
                    <p className="font-medium text-slate-900">{renewalDate}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Incluso no Pro</p>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  {[
                    'Membros ilimitados',
                    'Leads ilimitados',
                    'Pipeline ilimitado',
                    'Suporte prioritário',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-sky-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {subscription?.stripe_customer_id && (
                <ManageSubscriptionButton workspaceId={workspaceId} />
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Limites do plano Free</p>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-slate-400" />
                    Até 2 membros por workspace
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-slate-400" />
                    Até 50 leads
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                <div className="flex items-start gap-3">
                  <Zap className="mt-0.5 size-5 shrink-0 text-sky-500" />
                  <div className="space-y-1">
                    <p className="font-medium text-sky-900">Faça upgrade para o Pro</p>
                    <p className="text-sm text-sky-700">
                      Membros e leads ilimitados por apenas R$49/mês.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <UpgradeButton workspaceId={workspaceId} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
