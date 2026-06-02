'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from './server'
import { getSupabaseAdminClient } from './admin'
import type { LeadStatus, DealStage, ActivityType } from '@/types'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createWorkspace(name: string): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) redirect('/login')

  const trimmed = name.trim()
  const slug =
    trimmed
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') +
    '-' +
    Date.now().toString(36)

  const admin = getSupabaseAdminClient()

  const { data: workspace, error: wsError } = await admin
    .from('workspaces')
    .insert({ name: trimmed, slug })
    .select()
    .single()

  if (wsError || !workspace) {
    return { error: 'Erro ao criar workspace. Tente novamente.' }
  }

  const { error: memberError } = await admin.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'admin',
    status: 'active',
  })

  if (memberError) {
    return { error: 'Erro ao configurar permissões. Tente novamente.' }
  }

  await admin.from('subscriptions').insert({
    workspace_id: workspace.id,
    plan: 'free',
    status: 'active',
  })

  redirect('/dashboard')
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export type LeadInput = {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  position?: string | null
  status: LeadStatus
}

export async function createLead(
  workspaceId: string,
  data: LeadInput
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('leads').insert({
    workspace_id: workspaceId,
    name: data.name.trim(),
    email: data.email || null,
    phone: data.phone || null,
    company: data.company || null,
    position: data.position || null,
    status: data.status,
    owner_id: user.id,
  })

  if (error) return { error: 'Erro ao criar lead. Tente novamente.' }
  revalidatePath('/leads')
  return {}
}

export async function updateLead(
  id: string,
  data: LeadInput
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('leads')
    .update({
      name: data.name.trim(),
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      position: data.position || null,
      status: data.status,
    })
    .eq('id', id)

  if (error) return { error: 'Erro ao atualizar lead. Tente novamente.' }
  revalidatePath('/leads')
  revalidatePath(`/leads/${id}`)
  return {}
}

export async function deleteLead(id: string): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from('leads').delete().eq('id', id)

  if (error) return { error: 'Erro ao excluir lead. Tente novamente.' }
  revalidatePath('/leads')
  return {}
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export type DealInput = {
  title: string
  value: number
  lead_id: string
  stage: DealStage
  due_date?: string | null
}

export async function createDeal(
  workspaceId: string,
  data: DealInput
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('deals').insert({
    workspace_id: workspaceId,
    title: data.title.trim(),
    value: data.value,
    lead_id: data.lead_id,
    stage: data.stage,
    due_date: data.due_date || null,
    owner_id: user.id,
  })

  if (error) return { error: 'Erro ao criar negócio. Tente novamente.' }
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return {}
}

export async function updateDeal(
  id: string,
  data: DealInput
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('deals')
    .update({
      title: data.title.trim(),
      value: data.value,
      lead_id: data.lead_id,
      stage: data.stage,
      due_date: data.due_date || null,
    })
    .eq('id', id)

  if (error) return { error: 'Erro ao atualizar negócio. Tente novamente.' }
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteDeal(id: string): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from('deals').delete().eq('id', id)

  if (error) return { error: 'Erro ao excluir negócio. Tente novamente.' }
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return {}
}

export async function updateDealStage(
  id: string,
  stage: DealStage
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('deals')
    .update({ stage })
    .eq('id', id)

  if (error) return { error: 'Erro ao mover negócio.' }
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return {}
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function createActivity(
  workspaceId: string,
  leadId: string,
  type: ActivityType,
  description: string
): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('activities').insert({
    workspace_id: workspaceId,
    lead_id: leadId,
    type,
    description: description.trim(),
    user_id: user.id,
  })

  if (error) return { error: 'Erro ao registrar atividade.' }
  revalidatePath(`/leads/${leadId}`)
  revalidatePath('/dashboard')
  return {}
}
