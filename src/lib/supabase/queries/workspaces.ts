import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getActiveWorkspaceId(): Promise<string> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!data) redirect('/onboarding')
  return data.workspace_id
}
